import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import * as CS from "./src/visualization/coordinate-system.js";
import * as CUBOID from "./src/visualization/cuboid.js";
import * as SCHEME from "./src/model/scheme.js";
import * as RESET from "./src/visualization/reset.js";

const SETTINGS = {
    showGrid: false,
    gridSize: 1,
    example: "example2",
    interactiveMode: false
}

document.addEventListener("DOMContentLoaded", (e) => {
    main();
});

async function main() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    const showGridCheckBox = document.getElementById("show-grid-checkbox");
    const gridSizeNumberField = document.getElementById("grid-size");
    const exampleSelect = document.getElementById("example-picker");
    const normalizeButton = document.getElementById("normalize-button");
    const connectorButton = document.getElementById("connector-button");

    // default values
    interactiveCheckBox.checked = SETTINGS.interactiveMode;
    showGridCheckBox.checked = SETTINGS.showGrid;
    gridSizeNumberField.value = SETTINGS.gridSize;
    exampleSelect.value = SETTINGS.example;

    // event listeners
    interactiveCheckBox.addEventListener("change", (e) => {
        SETTINGS.interactiveMode = interactiveCheckBox.checked;
        changeCameraMode()
    });
    gridSizeNumberField.addEventListener("change", (e) => {
        SETTINGS.gridSize = gridSizeNumberField.value;

        RESET.resetGrid(SETTINGS.scene);
        if (SETTINGS.showGrid) {
            CS.drawGrid(SETTINGS.scene, SETTINGS.scheme, SETTINGS.gridSize);
        } 
    });
    showGridCheckBox.addEventListener("change", (e) => {
        SETTINGS.showGrid = showGridCheckBox.checked;

        RESET.resetGrid(SETTINGS.scene);
        if (SETTINGS.showGrid) {
            CS.drawGrid(SETTINGS.scene, SETTINGS.scheme, SETTINGS.gridSize);
        } 
    });
    exampleSelect.addEventListener("change", (e) => loadSchemeFromFile());
    normalizeButton.addEventListener("click", (e) => {
        SCHEME.normalize(SETTINGS.scheme);
    });
    connectorButton.addEventListener("click", (e) => {

    });

    // load default
    setupScene();
    loadSchemeFromFile();
}

function changeCameraMode() {
    const interactive = SETTINGS.interactiveMode;
    SETTINGS.controls.enableRotate = interactive;
    SETTINGS.controls.enableZoom = interactive;
    SETTINGS.controls.enablePan = interactive;
    SETTINGS.controls.autoRotate = !interactive;

    if (!interactive) {
        // this could be improved by determining the camera distance to the
        // center of the coordinate system using its fov.
        let x = 0;
        let y = 2 * (SETTINGS.scheme.bounds.y[1] - SETTINGS.scheme.bounds.y[0]);
        let z = SETTINGS.scheme.bounds.z[1] - SETTINGS.scheme.bounds.z[0];
        SETTINGS.camera.position.set(x, y, z);

        x = SETTINGS.scheme.bounds.x[1]; - SETTINGS.scheme.bounds.x[0];
        y = SETTINGS.scheme.bounds.y[1]; - SETTINGS.scheme.bounds.y[0];
        z = SETTINGS.scheme.bounds.z[1]; - SETTINGS.scheme.bounds.z[0];
        SETTINGS.camera.lookAt(x, y, z);
    }
}

export function loadScheme(scheme) {
    if (Object.hasOwn(SETTINGS, "scheme")) {
        RESET.resetScheme(SETTINGS.scene , SETTINGS.scheme);
    }

    SETTINGS.scheme = scheme
    CS.drawCS(SETTINGS.scene, SETTINGS.scheme);
    if (SETTINGS.showGrid) {
        CS.drawGrid(SETTINGS.scene, SETTINGS.scheme, SETTINGS.gridSize);
    } 
    CUBOID.drawScheme(SETTINGS.scene, SETTINGS.scheme);

    changeCameraMode();
}

async function loadSchemeFromFile() {
    const exampleSelect = document.getElementById("example-picker");
    const path = `data/${exampleSelect.value}.json`;
    if (Object.hasOwn(SETTINGS, "scheme")) {
        RESET.resetScheme(SETTINGS.scene , SETTINGS.scheme);
    }

    const scheme = await SCHEME.setup(path);
    loadScheme(scheme)
}

function setupScene() {
    SETTINGS.scene = new THREE.Scene();
    const canvas = document.getElementById("drawArea");
    SETTINGS.camera = new THREE.PerspectiveCamera( 75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    SETTINGS.scene.background = new THREE.Color( 0xd3d3d3 ); 
    
    // Camera controls
    SETTINGS.controls = new OrbitControls(SETTINGS.camera, renderer.domElement);
    SETTINGS.controls.enableDamping = true;
    SETTINGS.controls.autoRotateSpeed = -2.0;

    function animate() {
        requestAnimationFrame( animate );
        SETTINGS.controls.update();
        renderer.render( SETTINGS.scene, SETTINGS.camera );
    }
    animate();
}
