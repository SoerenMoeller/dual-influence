import Settings from "../util/Settings";
import * as Scheme from "../model/Scheme";
import * as SchemeController from "./SchemeController";
import * as Connector from "../model/Connector";
import * as ConnectorView from "../view/ConnectorView";


function init() {
    const connectorButton = document.getElementById("connector-button");
    const stOpacityPicker = document.getElementById("st-opacity");

    connectorButton.addEventListener("click", (e) => {
        Settings.showConnector = !Settings.showConnector; 

        if (Settings.showConnector) {
            Scheme.normalize(Settings.scheme);
            const connector = Connector.buildConnector(Settings.scheme);
            ConnectorView.drawConnector(Settings.scene, Settings.scheme, connector);

            Settings.opacity = 0;
            stOpacityPicker.value = 0;
            stOpacityPicker.previousElementSibling.innerText = Settings.opacity;
            SchemeController.changeOpacity(Settings.opacity);

            connectorButton.textContent = "Hide Connector";
        } else {
            stop();
            connectorButton.textContent = "Build Connector";
        }
    });
}


function stop() {
    const mesh = Settings.scene.getObjectByName("connector-mesh");
    const line = Settings.scene.getObjectByName("connector-line");
    if (mesh !== undefined) {
        Settings.scene.remove(mesh);
    }
    if (line !== undefined) {
        Settings.scene.remove(line);
    }
}


export { init };
