function saveOptions(e) {
    console.log("testing");
    e.preventDefault();
    browser.storage.sync.set({
        ignored: document.querySelector("#ignored").value
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#ignored").value = result.ignored;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get("ignored");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
