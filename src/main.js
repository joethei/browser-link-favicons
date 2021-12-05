const browser = require("webextension-polyfill");

async function processLinks(ignoredPages) {
    const arr = document.getElementsByTagName("a");
	if(ignoredPages === undefined) ignoredPages = Array.of();
    for (let arrElement of arr) {
        await prependIcon(arrElement, ignoredPages.ignored.split("\n"));
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
	el.style.verticalAlign = "bottom";
	el.style.marginBottom = "3px";
	el.style.marginLeft = "0";
    element.prepend(el);
}

function hasIcon(el) {
    if (el.getElementsByTagName("img").length > 0) return true;
    if (el.getElementsByTagName("svg").length > 0) return true;
}

async function getIconURL(url) {
    const domain = new URL(url);

	const setting = await browser.storage.sync.get("iconProvider");
	if(setting.iconProvider === undefined) setting.iconProvider = "google";
	if (setting.iconProvider === "google") {
		return "https://www.google.com/s2/favicons?domain=" + domain.hostname;
	}
	if (setting.iconProvider === "duckduckgo") {
		return "https://icons.duckduckgo.com/ip3/" + domain.hostname + ".ico";
	}
	if (setting.iconProvider === "iconhorse") {
		return "https://icon.horse/icon/" + domain.hostname;
	}
	if (setting.iconProvider === "splitbee") {
		return  "https://favicon.splitbee.io/?url=" + domain.hostname;
	}
}

const settings = browser.storage.sync.get("ignored");
settings.then(processLinks);
