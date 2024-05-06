import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Settings from "../util/Settings";
import * as SettingsController from "./SettingsController";
import * as SchemeController from "./SchemeController";
import * as BehaviorView from "../view/BehaviorView";
import { CANVAS_ID } from "../util/Constants";


/**
 * Initializes the scene.
 */
function init() {
    initScene();
    SettingsController.init();
}


/**
 * Initializes a threejs scene including camera and controls. 
 */
function initScene() {
    // create scene
    Settings.scene = new THREE.Scene();
    Settings.canvas = document.getElementById(CANVAS_ID);
    Settings.camera = new THREE.PerspectiveCamera( 60, Settings.canvas.offsetWidth / Settings.canvas.offsetHeight , 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: Settings.canvas
    });
    renderer.setSize(Settings.canvas.offsetWidth, Settings.canvas.offsetHeight);
    Settings.scene.background = new THREE.Color( 0xd3d3d3 ); 
            
    // setup camera controls
    Settings.controls = new OrbitControls(Settings.camera, renderer.domElement);
    Settings.controls.autoRotateSpeed = -2.0;
    
    // load svgs for rendering 
    BehaviorView.loadAllSVGs();
        
    function animate() {
        requestAnimationFrame( animate );
        Settings.controls.update();
        checkVisibilty(); 
        renderer.render( Settings.scene, Settings.camera );
    }
    animate();
}


/**
 * Redraws the behaviors (svgs), which are close to the camera. 
 * Greatly improves performance in large schemes.
 */
function checkVisibilty() {
    if (!Object.hasOwn(Settings, "scheme")) {
        return;
    }

    const pos = Settings.camera.position;
    const sts = Settings.scheme.statements.flat();
    SchemeController.stopBehaviors();

    const closeSts = sts.filter((st) => {
        const stCenter = new THREE.Vector3(st.centerX(), st.centerY(), st.centerZ());
        return pos.distanceTo(stCenter) <= Settings.threshold;
    });

    BehaviorView.drawBehaviors(Settings.scene, closeSts);
}


/**
 * Switches camera mode between fixed (rotating around scheme) and interactive
 */
function changeCameraMode() {
    const interactive = Settings.interactiveMode;
    Settings.controls.enableRotate = interactive;
    Settings.controls.enableZoom = interactive;
    Settings.controls.enablePan = interactive;
    Settings.controls.autoRotate = !interactive;

    if (!interactive) {
        // this could be improved by determining the camera distance to the
        // center of the coordinate system using its fov.
        let x = 0;
        let y = 3 * (Settings.scheme.bounds.y[1] - Settings.scheme.bounds.y[0]);
        let z = Settings.scheme.bounds.z[1] - Settings.scheme.bounds.z[0];
        Settings.camera.position.set(x, y, z);

        x = Settings.scheme.bounds.x[1]; - Settings.scheme.bounds.x[0];
        y = Settings.scheme.bounds.y[1]; - Settings.scheme.bounds.y[0];
        z = Settings.scheme.bounds.z[1]; - Settings.scheme.bounds.z[0];
        Settings.camera.lookAt(x, y, z);
    }
}


export { init, changeCameraMode };
