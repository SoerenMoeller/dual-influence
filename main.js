import Settings from "./src/util/Settings.js";
import * as SceneController from "./src/controller/SceneController.js";
import * as SchemeController from "./src/controller/SchemeController.js";
import * as Scheme from "./src/model/Scheme.js";


document.addEventListener("DOMContentLoaded", (e) => {
    main();
});


async function main() {
    SceneController.init();
    const scheme = await Scheme.loadSchemeFromFile(Settings.example);
    SchemeController.init(scheme);
}


async function main2() {
    const behaviorThresholdField = document.getElementById("behavior-threshold");
    const exampleSelect = document.getElementById("example-picker");
    const stOpacityPicker = document.getElementById("st-opacity");

    // default values
    behaviorThresholdField.value = Settings.threshold;
    exampleSelect.value = Settings.example;
    stOpacityPicker.value = Settings.opacity;

    // event listeners
    behaviorThresholdField.addEventListener("change", (e) => {
        Settings.threshold = behaviorThresholdField.value;
    });
    exampleSelect.addEventListener("change", (e) => loadSchemeFromFile());
    stOpacityPicker.addEventListener("change", (e) => {
        Settings.opacity = stOpacityPicker.value;
        RESET.changeOpacity(Settings.scene, Settings.opacity);
    });
}
