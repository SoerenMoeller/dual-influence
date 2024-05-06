import * as Scheme from "../model/Scheme";
import Settings from "../util/Settings";
import * as SettingsController from "./SettingsController";


function init() {
    const normalizeButton = document.getElementById("normalize-button");
    normalizeButton.addEventListener("click", (evt) => {
        if (Settings.scheme.normalized) {
            stop();
            normalizeButton.innerText = "Normalize";
        } else {
            Scheme.normalize(Settings.scheme);
            normalizeButton.innerText = "Denormalize";
        }
    });
}


function stop() {
    SettingsController.loadExample();
}


export { init, stop };