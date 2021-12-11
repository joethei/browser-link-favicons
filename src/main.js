const browser = require("webextension-polyfill");
const isFirefox = !chrome.app;

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
	el.style.width = "auto";
	el.style.verticalAlign = "middle";
	el.style.marginLeft = "0.2em";
	el.style.marginRight = "0.2em";
	el.style.display = "inline-block";

	//make sure the image is not blurry
	//condition is needed because chrome does not care about standards
	if(isFirefox) {
		el.style.imageRendering = "crisp-edges";
	}else {
		el.style.imageRendering = "-webkit-optimize-contrast";
	}
    element.prepend(el);
}

function hasIcon(el) {
    if (el.getElementsByTagName("img").length > 0) return true;
    if (el.getElementsByTagName("svg").length > 0) return true;

	//ignore all that don`t have any content
	if (!el.innerHTML) return true;
	if (!el.textContent) return true;
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
