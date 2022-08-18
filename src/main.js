const browser = require('webextension-polyfill');
const isFirefox = !chrome.app;

async function processLinks(ignoredPages) {
	const arr = document.getElementsByTagName("a");
	if (ignoredPages === undefined || ignoredPages.ignored === undefined) ignoredPages = {ignored: []};
	for (let arrElement of arr) {
		await prependIcon(arrElement, ignoredPages.ignored.split("\n"));
	}
}

async function prependIcon(element, ignored) {
	const href = element.href;

	if(element.href === undefined || element.href === "") return;

	let hostname;
	try {
		hostname = new URL(href).hostname;
	} catch (e) {
		console.log(href);
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
	const id = window.crypto.randomUUID();
	element.classList.add(id);
	browser.runtime.sendMessage({"url": href, "id": id});
}

function addIcon(message) {
	const el = document.createElement("img");
	el.classList.add("link-favicon");
	el.src = message.src;

	el.dataset.site = message.hostname;
	el.dataset.domain = window.location.hostname;

	//make sure the image is not blurry
	//condition is needed because chrome does not care about standards
	if (isFirefox) {
		el.style.imageRendering = "crisp-edges";
	} else {
		el.style.imageRendering = "-webkit-optimize-contrast";
	}
	document.getElementsByClassName(message.id)[0].prepend(el);
}


function hasIcon(el) {
	if (el.getElementsByTagName("img").length > 0) return true;
	if (el.getElementsByTagName("svg").length > 0) return true;

	//ignore all that don`t have any content
	if (!el.innerHTML) return true;
	if (!el.textContent) return true;
}

const fileref = document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", "resource://favicon-link@joethei.xyz/main.css");
document.getElementsByTagName("head")[0].appendChild(fileref);

browser.runtime.onMessage.addListener(addIcon);

const settings = browser.storage.sync.get("ignored");
settings.then(processLinks);
