// Open AI embeddings from page content
//
// IMPORTANT:
// You will need to supply your API key below on line 11 which will be stored
// as part of your SEO Spider configuration in plain text. Also be mindful if 
// sharing this script that you will be sharing your API key also unless you 
// delete it before sharing.
//

const OPENAI_API_KEY = 'YOUR-API-KEY';
const stopwords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at', 
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 
    'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 
    'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 
    'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 
    'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 
    'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 
    'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 
    'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 
    'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 
    'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 
    'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 
    'yours', 'yourself', 'yourselves',
    'facebook', 'twitter', 'instagram', 'linkedin', 'pinterest', 'snapchat', 'tiktok', 'youtube', 'whatsapp', 'reddit', 
    'wechat', 'tumblr', 'flickr', 'myspace', 'quora', 'vine', 'vkontakte', 'meetup', 'telegram', 'discord'
]);

const userContent = document.body.innerText;

const filteredContent = userContent
    .split(/\s+/)
    .filter(word => !stopwords.has(word.toLowerCase()))
    .join(' ');

function chatGptRequest() {
    return fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-3-small",
            input: `${filteredContent}`,
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
