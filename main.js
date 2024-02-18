import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import * as CS from "./src/coordinate-system.js";
import * as CUBOID from "./src/cuboid.js";
import * as SCHEME from "./src/scheme.js";

const scene = setupScene();
const scheme = await SCHEME.setup("data/example2.json");
CS.draw(scene, scheme);
for (const st of scheme.statements) {
    CUBOID.draw(scene, st);
}

let dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([1,0,0]), 3));
let dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xff0000 });
let dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);

dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,1,0]), 3));
dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0x00ff00 });
dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);

dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,1]), 3));
dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0x0000ff });
dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);

function setupScene() {
    const scene = new THREE.Scene();
    const canvas = document.getElementById("drawArea");
    console.log(canvas);
    console.log(canvas.innerWidth);
    const camera = new THREE.PerspectiveCamera( 75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvas
    });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    //renderer.setSize( window.innerWidth * 0.7, window.innerHeight * 0.7);
    scene.background = new THREE.Color( 0xd3d3d3 ); 

    camera.position.y = 30;
    camera.lookAt(0, 0, 0);

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;

    function animate() {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render( scene, camera );
    }
    animate();

    return scene;
}
