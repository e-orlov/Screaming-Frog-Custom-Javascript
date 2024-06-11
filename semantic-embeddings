// Directly load JSSoup library code
var JSSoup = (function () {
    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }

    var ARRAY_PROTO = Array.prototype;
    var REPLACE_CALL = Function.call.bind(String.prototype.replace);

    function _stripCSSComments(str) {
        return REPLACE_CALL(/\/\*.*?\*\//g, "", str);
    }

    function _splitSelector(selector) {
        var part = selector.match(/^\s*(>|\+|~)?\s*/)[0];
        return {
            combinator: part.trim(),
            rest: selector.slice(part.length)
        };
    }

    var Soup = function Soup(str, options) {
        if (str === void 0) {
            str = "";
        }

        if (options === void 0) {
            options = {};
        }

        this.options = options;

        var parser = new DOMParser();
        this._root = parser.parseFromString(str, "text/html").body;
    };

    var SoupElement = function () {
        SoupElement.prototype.constructor = SoupElement;

        function SoupElement() {}

        var _proto = SoupElement.prototype;

        _proto.get = function get(attr) {
            if (attr === void 0) {
                attr = "";
            }

            return this.attrs[attr] || null;
        };

        _proto.attrs = function attrs() {
            var attrs = {};

            if (this.element.hasAttributes()) {
                var attributes = this.element.attributes;
                for (var i = 0; i < attributes.length; i++) {
                    attrs[attributes[i].name] = attributes[i].value;
                }
            }

            return attrs;
        };

        _proto.text = function text() {
            return this.element.textContent;
        };

        _proto.toString = function toString() {
            return this.element.outerHTML;
        };

        return SoupElement;
    }();

    var Tag = function (_SoupElement) {
        _inheritsLoose(Tag, _SoupElement);

        function Tag(element) {
            var _this;

            _this = _SoupElement.call(this) || this;
            _this.element = element;
            return _this;
        }

        var _proto2 = Tag.prototype;

        _proto2.querySelector = function querySelector(selector) {
            var elements = this.element.querySelector(selector);
            if (elements) {
                return new Tag(elements);
            }
            return null;
        };

        _proto2.querySelectorAll = function querySelectorAll(selector) {
            var elements = ARRAY_PROTO.slice.call(this.element.querySelectorAll(selector));
            return elements.map(function (el) {
                return new Tag(el);
            });
        };

        _proto2.get = function get(attr) {
            return this.element.getAttribute(attr);
        };

        return Tag;
    }(SoupElement);

    var Comment = function (_SoupElement2) {
        _inheritsLoose(Comment, _SoupElement2);

        function Comment(element) {
            var _this3;

            _this3 = _SoupElement2.call(this) || this;
            _this3.element = element;
            return _this3;
        }

        return Comment;
    }(SoupElement);

    var JSSoup = Soup;

    JSSoup.Tag = Tag;
    JSSoup.Comment = Comment;

    return JSSoup;
})();
console.log('JSSoup loaded successfully');
console.log(typeof JSSoup); // Should output 'function'

// Function to process HTML content and generate markdown
function processHTML() {
    // Get the HTML content of the entire page
    var htmlContent = document.documentElement.outerHTML;

    // Create a JSSoup instance
    var soup = new JSSoup(htmlContent);

    // Extract the main content container
    var mainContentDiv = soup._root.querySelector('article') || soup._root.querySelector('div.content');

    // Initialize markdown content
    var markdownContent = "";

    // Function to check if an element should be ignored
    function shouldIgnoreElement(element) {
        if (!element.tagName) return true; // Ignore non-element nodes
        var classList = element.classList || [];
        var id = element.id || '';
        if (['img', 'button', 'input', 'form', 'header', 'footer', 'nav', 'aside', 'svg', 'span', 'a', 'shy', 'nbsp'].includes(element.tagName.toLowerCase())) return true;
        var ignoreClasses = ['btn', 'button', 'ad', 'advertisement', 'sponsored', 'banner', 'social', 'social-icon'];
        if (ignoreClasses.some(cls => classList.contains(cls))) return true;
        var ignoreIds = ['ad', 'advertisement', 'sponsored', 'banner'];
        if (ignoreIds.includes(id)) return true;
        return false;
    }

    // Recursive function to process elements and convert to markdown
    function processElement(element) {
        if (shouldIgnoreElement(element)) return "";

        var content = "";
        if (element.tagName.toLowerCase() === 'ul') {
            var listItems = Array.from(element.childNodes)
                .filter(child => !shouldIgnoreElement(child))
                .map(li => {
                    var text = processElement(li).trim();
                    return text ? `* ${text}` : '';
                })
                .filter(text => text) // Remove empty strings
                .join('\n');
            content += listItems + "\n\n";
        } else if (element.tagName.toLowerCase() === 'ol') {
            var listItems = Array.from(element.childNodes)
                .filter(child => !shouldIgnoreElement(child))
                .map((li, index) => {
                    var text = processElement(li).trim();
                    return text ? `${index + 1}. ${text}` : '';
                })
                .filter(text => text) // Remove empty strings
                .join('\n');
            content += listItems + "\n\n";
        } else if (element.tagName.toLowerCase() === 'blockquote') {
            content += `> ${element.textContent.trim()}\n\n`;
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tagName.toLowerCase())) {
            var level = parseInt(element.tagName.toLowerCase().replace('h', ''), 10);
            content += `${'#'.repeat(level)} ${element.textContent.trim()}\n\n`;
        } else if (element.tagName.toLowerCase() === 'p') {
            content += `${element.textContent.trim()}\n\n`;
        } else if (element.tagName.toLowerCase() === 'table') {
            var rows = Array.from(element.querySelectorAll('tr')).map(tr => {
                var cells = Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim()).join(' | ');
                return `| ${cells} |`;
            });
            if (rows.length > 1) {
                var headerSeparator = Array.from(rows[0].split('|')).map(() => '---').join(' | ');
                rows.splice(1, 0, `| ${headerSeparator} |`); // Add header separator after the first row
            }
            content += rows.join('\n') + "\n\n";
        } else if (element.tagName.toLowerCase() === 'tr' || element.tagName.toLowerCase() === 'th' || element.tagName.toLowerCase() === 'td') {
            // Handled within the table processing
            return "";
        } else if (element.tagName.toLowerCase() === 'li') {
            content += `${element.textContent.trim()}\n`;
        } else {
            Array.from(element.childNodes).forEach(child => {
                content += processElement(child).trim() + " ";
            });
        }
        return content;
    }

    // Process each relevant element in the main content
    if (mainContentDiv) {
        function processAllChildNodes(parentElement) {
            Array.from(parentElement.childNodes).forEach(child => {
                if (child.tagName) {
                    markdownContent += processElement(child).trim() + "\n";
                    processAllChildNodes(child); // Recursively process all child nodes
                }
            });
        }

        processAllChildNodes(mainContentDiv);

        // Combine all extracted elements with meta content
        var semanticContent = `# ${document.title}\n\n${markdownContent.trim()}`;

        // Filter out unwanted lines
        semanticContent = semanticContent.split('\n').filter(line => {
            // Remove lines that are just single words or uppercase words
            var trimmedLine = line.trim();
            return !(trimmedLine.split(' ').length === 1 || trimmedLine === trimmedLine.toUpperCase());
        }).join('\n');

        // Remove redundant lines
        var lines = semanticContent.split('\n');
        var uniqueLines = [...new Set(lines)];
        semanticContent = uniqueLines.join('\n');

        // Replace &shy; and &nbsp; with empty strings
        semanticContent = semanticContent.replace(/&shy;/g, '').replace(/&nbsp;/g, ' ');

        // Return the markdown content
        return semanticContent;
    } else {
        return '';
    }
}

// Call the function to process HTML
const markdownContent = processHTML();
console.log('Processed Markdown Content:', markdownContent);

// Open AI embeddings from page content
//
// IMPORTANT:
// You will need to supply your API key below on line 11 which will be stored
// as part of your SEO Spider configuration in plain text. Also be mindful if 
// sharing this script that you will be sharing your API key also unless you 
// delete it before sharing.
// 
//

const OPENAI_API_KEY = 'YOUR-API-KEY';

function chatGptRequest() {
    return fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: `${markdownContent}`,
            encoding_format: "float",
        })
    })
    .then(response => {
        if (!response.ok) {
             return response.text().then(text => {throw new Error(text)});
        }
        return response.json();
    })
    .then(data => {
        console.log(data.data[0].embedding);
        return data.data[0].embedding.toString();
    });
}

return chatGptRequest()
    .then(embeddings => seoSpider.data(embeddings))
    .catch(error => seoSpider.error(error));

