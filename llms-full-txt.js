// Generates llms-full.txt as markdown files for crawled URLs
// Makes use of Readability.js, Firefox native Read Mode, for semantic-first extraction
// Makes use of Turndown.js to handle tables
// Downloads files into FTP-friendly nested folder structure, using SF-native folder creation procedure

// Phase 1: Create folder structure — run this first to build paths
const baseExportDir = "C:/llms-export";
const pageUrl = window.location.href;
seoSpider.saveUrls([pageUrl], baseExportDir);

// Phase 2: llms-full.txt — run this second to save content without manifest
return seoSpider.loadScript("https://unpkg.com/@mozilla/readability@0.4.4/Readability.js")
  .then(() => seoSpider.loadScript("https://cdnjs.cloudflare.com/ajax/libs/turndown/7.2.0/turndown.min.js"))
  .then(() => {
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
    const markdownBody = turndown.turndown(article.content);
    const fullMarkdown = `${metadataBlock}\n\n# ${title}\n\n${markdownBody}`;

    const parsedUrl = new URL(pageUrl);
    const scheme = parsedUrl.protocol.replace(':', '');
    const host = parsedUrl.hostname;
    let path = parsedUrl.pathname;

    // Remove trailing slash and 'index' step
    if (path.endsWith('/')) path = path.slice(0, -1);
    path = path.replace(/\.(html?|php)$/, match => '-' + match.slice(1));
    path = path.replace(/[<>:"|?*]/g, '_');

    const autoFolder = `${baseExportDir}/${scheme}/${host}${path}`;
    const markdownPath = `${autoFolder}/llms-full.txt`;
    return seoSpider.saveText(fullMarkdown, markdownPath, false);
  })
  .catch(error => seoSpider.error(error.toString()));
