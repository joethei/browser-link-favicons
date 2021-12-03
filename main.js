async function processLinks(ignoredPages) {
    const ignored = ignoredPages.ignored.split("\n");
    const arr = document.getElementsByTagName("a");
    for (let arrElement of arr) {
        await prependIcon(arrElement, ignored);
    }
}

async function prependIcon(element, ignored) {
    const href = element.href;

    let hostname;
    try {
        hostname = new URL(href).hostname;
    } catch (e) {
        console.log(e);
    }
    if (!hostname) {
        return;
    }

    if (!href.includes("http")) {
        return;
    }
    if (window.location.hostname === hostname) {
        return;
    }
    if (ignored.includes(hostname)) {
        return;
    }
    if (hasIcon(element)) {
        return;
    }

    const el = document.createElement("img");
    el.src = await getIconURL(href);
    el.style.height = "1em";
    element.prepend(el);
}

function hasIcon(el) {
    if (el.getElementsByTagName("img").length > 0) return true;
    if (el.getElementsByTagName("svg").length > 0) return true;
}

async function getIconURL(url) {
    const domain = new URL(url);

    const source = await browser.storage.sync.get("source");
    if (source.source === "google") {
        return "https://www.google.com/s2/favicons?domain=" + domain.hostname;
    }
    if (source.source === "duckduckgo") {
        return "https://icons.duckduckgo.com/ip3/" + domain.hostname + ".ico";
    }
}

let ignoredPages = browser.storage.sync.get("ignored");
ignoredPages.then(processLinks);

