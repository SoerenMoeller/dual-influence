import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import SETTINGS from "../util/Settings";
import { CANVAS_ID } from "../util/Constants";


/**
 * Initializes the scene.
 */
function init() {
    // create scene
    SETTINGS.scene = new THREE.Scene();
    SETTINGS.canvas = document.getElementById(CANVAS_ID);
    SETTINGS.camera = new THREE.PerspectiveCamera( 60, SETTINGS.canvas.offsetWidth / SETTINGS.canvas.offsetHeight , 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: SETTINGS.canvas
    });
    renderer.setSize(SETTINGS.canvas.offsetWidth, SETTINGS.canvas.offsetHeight);
    SETTINGS.scene.background = new THREE.Color( 0xd3d3d3 ); 
        
    // setup camera controls
    SETTINGS.controls = new OrbitControls(SETTINGS.camera, renderer.domElement);
    SETTINGS.controls.autoRotateSpeed = -2.0;
    
    function animate() {
        requestAnimationFrame( animate );
        SETTINGS.controls.update();
        //checkVisibilty(); TODO
        renderer.render( SETTINGS.scene, SETTINGS.camera );
    }
    animate();
}

export { init };
