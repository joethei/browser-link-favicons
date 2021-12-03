function prependIcon(ignoredPages) {
    const ignored = ignoredPages.ignored.split("\n");
    const arr = document.getElementsByTagName("a");
    for (let arrElement of arr) {
        test(arrElement, ignored);
    }
}

function test(element, ignored) {
    const href = element.href;
    const hostname = new URL(href).hostname;
    if(!href.includes("http")) {
        return;
    }
    if(window.location.hostname === hostname) {
        return;
    }
    if(ignored.includes(hostname)) {
        return;
    }
    if (hasIcon(element)) {
        return;
    }

    const iconUrl = getIconURL(href);
    const el = document.createElement("img");
    el.onerror = () => {

    };
    el.src = iconUrl;
    el.style.height = "1em";
    element.prepend(el);
}

function hasIcon(el) {
    if(el.getElementsByTagName("img").length > 0) return true;
    if(el.getElementsByTagName("svg").length > 0) return true;
}

function getIconURL(url) {
    const domain = new URL(url);
    return "https://icons.duckduckgo.com/ip3/" + domain.hostname + ".ico"
}

let ignoredPages = browser.storage.sync.get("ignored");
ignoredPages.then(prependIcon);
