var browser = require("webextension-polyfill");

function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		ignored: document.querySelector("#ignored").value,
		iconProvider: document.querySelector("#iconProvider").value
	});
}

function restoreOptions() {

	function setCurrentChoice(result) {
		console.log(result);
		document.querySelector("#ignored").value = result.ignored || "";
		document.querySelector("#iconProvider").value = result.iconProvider || "google";
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	let getting = browser.storage.sync.get();
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
