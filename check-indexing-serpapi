// Code by Marco Ianni, https://www.linkedin.com/in/marco-ianni7/
// Snippet checks indexing status of an URL using SerpApi

const SERPAPI_API_KEY = 'your api key'; // Ensure this is correctly filled
const currentPageUrl = window.location.href;

function serpApiRequest() {
    const url = new URL('https://lnkd.in/dBrEWjGh'); // https://serpapi.com/search.json added here in case LinkedIn edits the URL
    url.search = new URLSearchParams({
        engine: "google",
        q: currentPageUrl,
        api_key: SERPAPI_API_KEY
    });

    return fetch(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        const urls = data.organic_results.map(result => result.link);
        return urls.includes(currentPageUrl) ? "indexed" : "not indexed";
    });
}

serpApiRequest()
    .then(status => seoSpider.data(status))
    .catch(error => seoSpider.error(error));
