// This click action let Screaming Frog Chromium accept all cookies.
// Remember to activate Javascript rendering befor crawl!
// Set the click timer to the time after you set the rendering timer. Example: rendering timer default setting == 5 seconds, click action timer == 6 seconds
// Script finds buttons with diacritic characters in labels and also finds buttons located in the shadow DOM.
// Feel free to extend the code!

function removeDiacritics(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findButtonByLabels(labels) {
    // Normalize and lower-case the labels to make the matching diacritic-insensitive and case-insensitive
    const normalizedLabels = labels.map(label => removeDiacritics(label.toLowerCase()));

    // Method 1: XPath approach
    const xpath = normalizedLabels
        .map(label => `contains(translate(normalize-space(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')), 'ÁÉÍÓÚÜÑáéíóúüñäöü', 'AEIOUUNaeiouunaou'), '${label}')`)
        .join(" or ");
    const finalXpath = `//button[${xpath}]`;
    const targetButtonByXPath = document.evaluate(finalXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    // Method 2: Shadow DOM approach
    let targetButtonByShadowDOM;
    const elementsWithShadowDOM = document.querySelectorAll("*");
    elementsWithShadowDOM.forEach(element => {
        if (element.shadowRoot) {
            const shadowRoot = element.shadowRoot;
            const buttonsInShadowDOM = shadowRoot.querySelectorAll("button");
            buttonsInShadowDOM.forEach(button => {
                if (normalizedLabels.some(label => button.textContent.toLowerCase().includes(label))) {
                    targetButtonByShadowDOM = button;
                    return;
                }
            });
        }
    });

    // Return the first button found by either method
    return targetButtonByXPath || targetButtonByShadowDOM;
}

function clickButtonByLabels(labels) {
    const targetButton = findButtonByLabels(labels);

    if (targetButton) {
        console.log(`Button with label found and clicked: ${targetButton.textContent.trim()}`);
        targetButton.click();
    } else {
        console.log('No button found with the specified labels');
    }
}

// Example usage with diacritic and case insensitivity
clickButtonByLabels(['Accept', 'Confirm', 'Agree', 'Aktivieren', 'Akzeptieren', 'Zulassen', 'Erlauben', 'Auswählen']);
