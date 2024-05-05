import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import SETTINGS from "./src/util/Settings.js";
import * as SceneController from "./src/controller/SceneController.js"
import * as SchemeController from "./src/controller/SchemeController.js"
import * as CoordinateSystem from "./src/view/CoordinateSystemView.js";
import * as CONNECTOR from "./src/model/connector.js";
import * as Constants from "./src/util/Constants.js"
import * as SCHEME from "./src/model/Scheme.js";
import * as RESET from "./src/visualization/reset.js";
import * as Scheme from "./src/model/Scheme.js";


document.addEventListener("DOMContentLoaded", (e) => {
    main();
});

async function main() {
    SceneController.init();
    const scheme = await Scheme.loadSchemeFromFile(SETTINGS.example);
    SchemeController.init(scheme);
}

async function main2() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    const showGridCheckBox = document.getElementById("show-grid-checkbox");
    const behaviorThresholdField = document.getElementById("behavior-threshold");
    const gridSizeNumberField = document.getElementById("grid-size");
    const exampleSelect = document.getElementById("example-picker");
    const normalizeButton = document.getElementById("normalize-button");
    const connectorButton = document.getElementById("connector-button");
    const stOpacityPicker = document.getElementById("st-opacity");
    const mousePositionField = document.getElementById("mouse-position");

    // default values
    interactiveCheckBox.checked = SETTINGS.interactiveMode;
    showGridCheckBox.checked = SETTINGS.showGrid;
    behaviorThresholdField.value = SETTINGS.threshold;
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
            CoordinateSystem.drawGrid(SETTINGS.scene, SETTINGS.scheme, SETTINGS.gridSize);
        } 
    });
    showGridCheckBox.addEventListener("change", (e) => {
        SETTINGS.showGrid = showGridCheckBox.checked;

        RESET.resetGrid(SETTINGS.scene);
        if (SETTINGS.showGrid) {
            CoordinateSystem.drawGrid(SETTINGS.scene, SETTINGS.scheme, SETTINGS.gridSize);
        } 
    });
    behaviorThresholdField.addEventListener("change", (e) => {
        SETTINGS.threshold = behaviorThresholdField.value;
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
        SETTINGS.showConnector = !SETTINGS.showConnector; 

        if (SETTINGS.showConnector) {
            SCHEME.normalize(SETTINGS.scheme);
            CONNECTOR.build(SETTINGS.scheme, SETTINGS.scene);

            SETTINGS.opacity = 0;
            stOpacityPicker.value = 0;
            RESET.changeOpacity(SETTINGS.scene, SETTINGS.opacity);

            connectorButton.textContent = "Hide Connector";
        } else {
            RESET.resetConnector(SETTINGS.scene);
            connectorButton.textContent = "Build Connector";
        }
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
    await loadSchemeFromFile();
}

export function loadScheme(scheme) {
    if (Object.hasOwn(SETTINGS, "scheme")) {
        RESET.resetScheme(SETTINGS.scene , SETTINGS.scheme);
    }

    SETTINGS.scheme = scheme
    CoordinateSystem.drawCoordinateSystem(SETTINGS.scene, SETTINGS.scheme);
    //CUBOID.drawScheme(SETTINGS.scene, SETTINGS.scheme, SETTINGS.opacity);
    //SETTINGS.scene.traverse( function( object ) {
    //    object.frustumCulled = false;
    //} );

    changeCameraMode();
}

async function loadSchemeFromFile() {
    const exampleSelect = document.getElementById("example-picker");
    const path = `${Constants.EXAMPLES_FOLDER}/${exampleSelect.value}.json`;
    if (Object.hasOwn(SETTINGS, "scheme")) {
        RESET.resetScheme(SETTINGS.scene , SETTINGS.scheme);
    }

    const scheme = await SCHEME.setup(path);
    loadScheme(scheme)
}

function checkVisibilty() {
    return;
    if (!Object.hasOwn(SETTINGS, "scheme")) {
        return;
    }

    const pos = SETTINGS.camera.position;
    const sts = SETTINGS.scheme.statements.flat();
    RESET.resetBehaviors(SETTINGS.scene);

    const closeSts = sts.filter((st) => pos.distanceTo(new THREE.Vector3(st.centerX(), st.centerY(), st.centerZ())) <= SETTINGS.threshold);
    CUBOID.drawBehaviors(SETTINGS.scene, closeSts);
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
        checkVisibilty();
        renderer.render( SETTINGS.scene, SETTINGS.camera );
    }
    animate();
}
