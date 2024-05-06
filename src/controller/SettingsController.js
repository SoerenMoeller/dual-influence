import * as THREE from "three";
import Settings from "../util/Settings";
import * as Scheme from "../model/Scheme";
import * as ConnectorController from "./ConnectorController";
import * as MenuController from "./MenuController";
import { changeCameraMode } from "./SceneController";


/**
 * Initializes the settings, the menu, and the buttons.
 */
function init() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    const behaviorThresholdField = document.getElementById("behavior-threshold");
    const exampleSelect = document.getElementById("example-picker");
    const stOpacityPicker = document.getElementById("st-opacity");

    interactiveCheckBox.checked = Settings.interactiveMode;
    behaviorThresholdField.value = Settings.threshold;
    exampleSelect.value = Settings.example;
    stOpacityPicker.value = Settings.opacity;

    initInteractiveMode();
    initCoordinateView();
    initNormalizer();

    MenuController.init();
    ConnectorController.init();
}


function initInteractiveMode() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    interactiveCheckBox.addEventListener("change", (e) => {
        Settings.interactiveMode = interactiveCheckBox.checked;
        changeCameraMode()
    });
}


function initCoordinateView() {
    const mousePositionField = document.getElementById("mouse-position");

    document.addEventListener("mousemove", (e) => {
        var vec = new THREE.Vector3(); 
        var pos = new THREE.Vector3(); 

        vec.set(
            ( e.clientX / Settings.canvas.offsetWidth ) * 2 - 1,
            - ( e.clientY / Settings.canvas.offsetHeight ) * 2 + 1,
            0.5,
        );
            
        vec.unproject( Settings.camera );
        vec.sub( Settings.camera.position ).normalize();
        var distance = - Settings.camera.position.z / vec.z;
        pos.copy( Settings.camera.position ).add( vec.multiplyScalar( distance ) );
        mousePositionField.innerHTML = `x: ${pos.x.toFixed(2)}, z: ${pos.y.toFixed(2)}`;
    });
}


function initNormalizer() {
    //const normalizeButton = document.getElementById("normalize-button");
    //normalizeButton.addEventListener("click", (e) => {
    //    Scheme.normalize(Settings.scheme);
    //});
}


export { init };
