import * as THREE from "three";
import Settings from "../util/Settings";
import * as SceneController from "./SceneController";
import * as SchemeController from "./SchemeController";
import * as Scheme from "../model/Scheme";
import * as MenuController from "./MenuController";


/**
 * Initializes the settings.
 */
function init() {
    setupInteractiveMode();
    setupCoordinateView();
    setupOpacityPicker();
    setupBehaviorRenderRange();
    setupExampleSelector();
}


function setupExampleSelector() {
    const exampleSelect = document.getElementById("example-picker");
    exampleSelect.value = Settings.example;

    exampleSelect.addEventListener("change", async (evt) => {
        Settings.example = exampleSelect.value;
        SchemeController.stop();
        const scheme = await Scheme.loadSchemeFromFile(Settings.example);
        SchemeController.init(scheme);
        MenuController.closeMenu();
    });
}


function setupBehaviorRenderRange() {
    const behaviorThresholdField = document.getElementById("behavior-threshold");
    behaviorThresholdField.value = Settings.threshold;
    behaviorThresholdField.previousElementSibling.innerText = Settings.threshold;

    // event listeners
    behaviorThresholdField.addEventListener("change", (e) => {
        Settings.threshold = behaviorThresholdField.value;
    });
}


function setupOpacityPicker() {
    const stOpacityPicker = document.getElementById("st-opacity");
    stOpacityPicker.value = Settings.opacity;
    stOpacityPicker.previousElementSibling.innerText = Settings.opacity;

    stOpacityPicker.addEventListener("change", (evt) => {
        Settings.opacity = stOpacityPicker.value;
        SchemeController.changeOpacity(Settings.scene, Settings.opacity);
    });
}


function setupInteractiveMode() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    interactiveCheckBox.checked = Settings.interactiveMode;

    // default value
    const setInteractiveField = (isSet) => {
        const interacticeField = document.getElementById("interactive-mode");
        const state = isSet ? "on" : "off";
        interacticeField.innerText = `Interactive Mode: ${state}`;

    }
    setInteractiveField(Settings.interactiveMode);
    
    // on change
    interactiveCheckBox.addEventListener("change", (evt) => {
        Settings.interactiveMode = interactiveCheckBox.checked;
        setInteractiveField(Settings.interactiveMode);
        SceneController.changeCameraMode();
    });

    // setup keybind
    document.addEventListener("keydown", (evt) => {
        if (evt.key === "i") {
            Settings.interactiveMode = !Settings.interactiveMode;
            interactiveCheckBox.checked = Settings.interactiveMode;
            setInteractiveField(Settings.interactiveMode);
            SceneController.changeCameraMode();

            evt.stopImmediatePropagation();
        } 
    });
}


function setupCoordinateView() {
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


export { init };
