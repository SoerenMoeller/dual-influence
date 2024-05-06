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
