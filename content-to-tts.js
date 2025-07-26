// Prepares content for Text-To-Speach
// Cleans CTAs and orphan sentences out
// Turns tables into readable form

const baseExportDir = "C:/llms-export";
const pageUrl = window.location.href;
seoSpider.saveUrls([pageUrl], baseExportDir);

function detectOrphanLines(content) {
  const lines = content.split(/\r?\n/);
  const marked = lines.map((line, i) => {
    const nextEmpty = (i < lines.length - 1) && lines[i + 1].trim() === '';
    const isHeading = /^#+\s/.test(line.trim());
    const isList = /^[-*]\s/.test(line.trim());
    const wordCount = line.trim().split(/\s+/).length;
    if (!isHeading && !isList && nextEmpty && wordCount <= 5) {
      return `[ORPHAN?] ${line}`;
    }
    return line;
  });
  return marked.join('\n');
}

return seoSpider.loadScript("https://unpkg.com/@mozilla/readability@0.4.4/Readability.js")
  .then(() => seoSpider.loadScript("https://cdnjs.cloudflare.com/ajax/libs/turndown/7.2.0/turndown.min.js"))
  .then(async () => {
    const cloned = document.cloneNode(true);
    const article = new Readability(cloned).parse();
    if (!article || !article.content) {
      return seoSpider.data("Skipped: no readable content");
    }

    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    turndown.addRule('tables', {
      filter: node => node.nodeName === 'TABLE',
      replacement: function (_, node) {
        const rows = [];
        node.querySelectorAll('tr').forEach((tr, i) => {
          const cells = Array.from(tr.children).map(cell =>
            cell.textContent.trim().replace(/\|/g, '\\|')
          );
          const row = '| ' + cells.join(' | ') + ' |';
          rows.push(row);
          if (i === 0) rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
        });
        return '\n\n' + rows.join('\n') + '\n\n';
      }
    });

    const title = article.title || '';
    const metaTitle = document.title?.trim() || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content?.trim() || '';
    const retrievedAt = new Date().toISOString().split('T')[0];
    const metadataBlock = `<!--\nsource-url: ${pageUrl}\nmeta-title: ${metaTitle}\nmeta-description: ${metaDescription}\nretrieved-at: ${retrievedAt}\n-->`;

    const rawContent = `${metadataBlock}\n\n# ${title}\n\n${turndown.turndown(article.content)}`;
    const preprocessedContent = detectOrphanLines(rawContent);

    const OPENAI_API_KEY = window.OPENAI_API_KEY || "PASTE_YOUR_OPENAI_API_KEY_HERE";
    const OPENROUTER_API_KEY = window.OPENROUTER_API_KEY || "PASTE_YOUR_OPENROUTER_API_KEY_HERE";

    async function callModel(url, keyName, apiKey, content, retries = 2, delay = 3000) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a cleaning filter for text-to-speech. Remove only obvious UI noise (like navigation, cookie banners, social share prompts) and orphan metadata lines (author names alone, dates alone, read times). Keep every other part of the text exactly as provided, with no shortening, summarizing, or rewording. Retain all paragraphs, lists, and detailed explanations as-is. Additionally, convert Markdown table blocks into full human-readable sentences that describe their content naturally, without dropping or compressing any data."
              },
              { role: "user", content }
            ]
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limited on ${keyName}. Retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          return callModel(url, keyName, apiKey, content, retries - 1, delay * 2);
        }
        if (!response.ok) throw new Error(`${keyName} filtering failed: ${response.status}`);
        const json = await response.json();
        return json.choices[0].message.content.trim();
      } catch (e) {
        if (e.name === 'AbortError') throw new Error(`${keyName} request timed out`);
        throw e;
      }
    }

    let cleanedContent;
    try {
      cleanedContent = await callModel("https://api.openai.com/v1/chat/completions", "OpenAI", OPENAI_API_KEY, preprocessedContent);
    } catch (e1) {
      console.log(e1.message + " Falling back to OpenRouter...");
      cleanedContent = await callModel("https://openrouter.ai/api/v1/chat/completions", "OpenRouter", OPENROUTER_API_KEY, preprocessedContent);
    }

    const parsedUrl = new URL(pageUrl);
    const scheme = parsedUrl.protocol.replace(':', '');
    const host = parsedUrl.hostname;
    let path = parsedUrl.pathname;
    if (path.endsWith('/')) path = path.slice(0, -1);
    path = path.replace(/\.(html?|php)$/, match => '-' + match.slice(1));
    path = path.replace(/[<>:"|?*]/g, '_');

    const autoFolder = `${baseExportDir}/${scheme}/${host}${path}`;
    const markdownPath = `${autoFolder}/tts.txt`;
    return seoSpider.saveText(cleanedContent, markdownPath, false);
  })
  .catch(error => seoSpider.error(error.toString()));
