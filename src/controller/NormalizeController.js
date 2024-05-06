import * as Scheme from "../model/Scheme";
import Settings from "../util/Settings";


function init() {
    const normalizeButton = document.getElementById("normalize-button");
    normalizeButton.addEventListener("click", (evt) => {
        Scheme.normalize(Settings.scheme);
    });
}


export { init };