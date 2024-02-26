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
    interactiveMode: false,
    opacity: 0.3,
    showBehavior: true
}

document.addEventListener("DOMContentLoaded", (e) => {
    main();
});

async function main() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    const showGridCheckBox = document.getElementById("show-grid-checkbox");
    const showBehaviorCheckBox = document.getElementById("show-behavior-checkbox");
    const gridSizeNumberField = document.getElementById("grid-size");
    const exampleSelect = document.getElementById("example-picker");
    const normalizeButton = document.getElementById("normalize-button");
    const connectorButton = document.getElementById("connector-button");
    const stOpacityPicker = document.getElementById("st-opacity");
    const mousePositionField = document.getElementById("mouse-position");

    // default values
    interactiveCheckBox.checked = SETTINGS.interactiveMode;
    showGridCheckBox.checked = SETTINGS.showGrid;
    showBehaviorCheckBox.checked = SETTINGS.showBehavior;
    gridSizeNumberField.value = SETTINGS.gridSize;
    exampleSelect.value = SETTINGS.example;
    stOpacityPicker.value = SETTINGS.opacity;

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
    showBehaviorCheckBox.addEventListener("change", (e) => {
        SETTINGS.showBehavior = showBehaviorCheckBox.checked;

        if (SETTINGS.showBehavior) {
            CUBOID.drawBehaviors(SETTINGS.scene, SETTINGS.scheme);
        } else {
            RESET.resetBehaviors(SETTINGS.scene);
        }
    });
    exampleSelect.addEventListener("change", (e) => loadSchemeFromFile());
    stOpacityPicker.addEventListener("change", (e) => {
        SETTINGS.opacity = stOpacityPicker.value;
        RESET.changeOpacity(SETTINGS.scene, SETTINGS.opacity);
    });
    normalizeButton.addEventListener("click", (e) => {
        SCHEME.normalize(SETTINGS.scheme);
    });
    connectorButton.addEventListener("click", (e) => {

    });
    document.addEventListener("mousemove", (e) => {
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse

        vec.set(
        ( e.clientX / SETTINGS.canvas.offsetWidth ) * 2 - 1,
        - ( e.clientY / SETTINGS.canvas.offsetHeight ) * 2 + 1,
        0.5,
        );
            
        vec.unproject( SETTINGS.camera );
            
        vec.sub( SETTINGS.camera.position ).normalize();
            
        var distance = - SETTINGS.camera.position.z / vec.z;
            
        pos.copy( SETTINGS.camera.position ).add( vec.multiplyScalar( distance ) );
        mousePositionField.innerHTML = `x: ${pos.x.toFixed(2)}, z: ${pos.y.toFixed(2)}`;
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
    CUBOID.drawScheme(SETTINGS.scene, SETTINGS.scheme, SETTINGS.opacity);
    SETTINGS.scene.traverse( function( object ) {
        object.frustumCulled = false;
    } );

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
    SETTINGS.canvas = document.getElementById("drawArea");
    SETTINGS.camera = new THREE.PerspectiveCamera( 60, SETTINGS.canvas.offsetWidth / SETTINGS.canvas.offsetHeight , 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: SETTINGS.canvas
    });
    renderer.setSize(SETTINGS.canvas.offsetWidth, SETTINGS.canvas.offsetHeight);
    SETTINGS.scene.background = new THREE.Color( 0xd3d3d3 ); 
    
    // Camera controls
    SETTINGS.controls = new OrbitControls(SETTINGS.camera, renderer.domElement);
    SETTINGS.controls.autoRotateSpeed = -2.0;

    function animate() {
        requestAnimationFrame( animate );
        SETTINGS.controls.update();
        renderer.render( SETTINGS.scene, SETTINGS.camera );
    }
    animate();
}
