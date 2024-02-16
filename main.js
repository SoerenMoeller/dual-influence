import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { drawCoordinateSystem } from './src/coordinate-system.js';
import { drawCuboid } from './src/cuboid.js';
import { renderSVG } from './src/svg.js';
import { setupModel } from './src/model.js';


const scene = setupScene();
const model = await setupModel("data/example.json");
console.log(model);
drawCoordinateSystem(scene, model);


function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    scene.background = new THREE.Color( 0xffffff ); 

    camera.position.z = 5;

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );
    }
    animate();

    return scene;
}
