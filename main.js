import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import * as CS from "./src/visualization/coordinate-system.js";
import * as CUBOID from "./src/visualization/cuboid.js";
import * as SCHEME from "./src/model/scheme.js";
import * as RESET from "./src/visualization/reset.js";

const SETTINGS = {
    showGrid: false,
    gridSize: 1,
    example: "example",
    interactiveMode: false,
    opacity: 0.3
}

document.addEventListener("DOMContentLoaded", (e) => {
    main();
});

function main() {
    const scene = new THREE.Scene()
    const canvas = document.getElementById("drawArea");
    const camera = new THREE.PerspectiveCamera( 75, canvas.offsetWidth / canvas.offsetHeight , 0.1, 1000 );
    camera.position.z = 100
    camera.lookAt(0, 0, 0)
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0.9)
    //container.appendChild(renderer.domElement)
    
    const axesHelper = new THREE.AxesHelper(1000)
    
    scene.add(axesHelper)
    
    const controls = new OrbitControls(camera, renderer.domElement)
    
    const instMat = new THREE.LineBasicMaterial({
        color: 0x000000, 
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-scale').textContent;
        }
    });
    const materialScale = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            lightDirection: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() }
          },
          fragmentShader: document.getElementById('fragment-shader').textContent,
          vertexShader: document.getElementById('vertex-shader-scale').textContent
        })
    
    const baseGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(20, 32, 16))
    const instancedGeom = new THREE.InstancedBufferGeometry().copy(baseGeom)
    instancedGeom.instanceCount = 10
    
    const colorArr = []
    const posArr = []
    const scaleArr = []
    for(let i = 0;i < 100;i++){
        scaleArr.push(Math.random() * 2);
        new THREE.Color(0xFF00FF).toArray(colorArr, i*3)
        posArr.push(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200)
    }
    
    instancedGeom.setAttribute(
          'aColor',
          new THREE.InstancedBufferAttribute(new Float32Array(colorArr), 3, false)
        )
    instancedGeom.setAttribute(
          'aPosition',
          new THREE.InstancedBufferAttribute(new Float32Array(posArr), 3, false))
    instancedGeom.setAttribute(
        'aScale',
        new THREE.InstancedBufferAttribute(new Float32Array(scaleArr), 3, false))
        
    scene.add(new THREE.LineSegments(instancedGeom, instMat))
    
    animate()
    
    function animate(){
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      controls.update()
    }
}

async function main2() {
    const interactiveCheckBox = document.getElementById("interactive-checkbox");
    const showGridCheckBox = document.getElementById("show-grid-checkbox");
    const gridSizeNumberField = document.getElementById("grid-size");
    const exampleSelect = document.getElementById("example-picker");
    const normalizeButton = document.getElementById("normalize-button");
    const connectorButton = document.getElementById("connector-button");
    const stOpacityPicker = document.getElementById("st-opacity");
    const mousePositionField = document.getElementById("mouse-position");

    // default values
    interactiveCheckBox.checked = SETTINGS.interactiveMode;
    showGridCheckBox.checked = SETTINGS.showGrid;
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
    exampleSelect.addEventListener("change", (e) => loadSchemeFromFile());
    stOpacityPicker.addEventListener("change", (e) => {
        SETTINGS.opacity = stOpacityPicker.value;
        RESET.changeOpacity(SETTINGS.scene, SETTINGS.scheme, SETTINGS.opacity);
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
    SETTINGS.camera = new THREE.PerspectiveCamera( 75, SETTINGS.canvas.offsetWidth / SETTINGS.canvas.offsetHeight , 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        canvas: SETTINGS.canvas
    });
    renderer.setSize(SETTINGS.canvas.offsetWidth, SETTINGS.canvas.offsetHeight);
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
