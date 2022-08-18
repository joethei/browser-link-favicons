const browser = require("webextension-polyfill");

browser.runtime.onMessage.addListener(process);

async function process(message) {
	const domain = new URL(message.url);
	const src = await getIconURL(domain);
	const tabs = await browser.tabs.query({currentWindow: true, active: true});
	for (let tab of tabs) {
		browser.tabs.sendMessage(tab.id, {"id": message.id, "src": src, "hostname": domain.hostname});
	}
}

function blobToBase64(blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}

async function getIconURL(domain) {
	const hostname = domain.hostname;

	const cached = await browser.storage.local.get(hostname);
	if (cached[hostname]) return cached[hostname];

	let result;
	const setting = await browser.storage.sync.get("iconProvider");
	if (setting.iconProvider === undefined) setting.iconProvider = "google";
	if (setting.iconProvider === "google") {
		result = "https://www.google.com/s2/favicons?domain=" + hostname;
	}
	if (setting.iconProvider === "googlecn") {
		result = "https://www.google.cn/s2/favicons?domain=" + hostname;
	}
	if (setting.iconProvider === "duckduckgo") {
		result = "https://icons.duckduckgo.com/ip3/" + hostname + ".ico";
	}
	if (setting.iconProvider === "iconhorse") {
		result = "https://icon.horse/icon/" + hostname;
	}
	if (setting.iconProvider === "splitbee") {
		result = "https://favicon.splitbee.io/?url=" + hostname;
	}
	if (setting.iconProvider === "yandex") {
		result = "https://favicon.yandex.net/favicon/" + hostname;
	}

	if (!result) {
		console.error("Could not generate Favicon URL");
		return "";
	}

	const content = await fetch(result);
	const buffer = await content.arrayBuffer();
	const view = new Uint8Array(buffer);
	const blob = new Blob([view], {type: "image/png"});
	const base64 = await blobToBase64(blob);

	browser.storage.local.set({
		hostname: base64
	});

	return base64;

}
