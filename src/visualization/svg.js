import { SVGLoader } from "three/addons/loaders/SVGLoader";
import * as THREE from "three";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

const SVG = {};
for (const quali of [C.MONO, C.ANTI, C.ARB, C.CONST]) {
    loadSVG(quali);
}

export function drawCuboidQualities(scene, sts) {
    if (sts.length == 0) {
        return;
    }
    
    console.log(sts);
    const stsMono = sts.filter((e) => {return e.xq == C.MONO});
    console.log(stsMono);
    console.log(SVG[C.MONO].geometry);
    const ins = new THREE.InstancedBufferGeometry().copy(SVG[C.MONO].geometry);
    ins.instanceCount = stsMono.length;
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-rotate').textContent;
        } 
    });

    const dim = getDimensions(SVG[C.MONO]);

    const instPos = [];
    const instScale = [];
    const instRotate = [];
    for (let i = 0; i < sts.length; i++) {
        instPos.push(0,0,0);
        instScale.push(0.0005, 0.0005, 0.0005);
        instRotate.push(Math.PI/2, 0, 0);
    }

    ins.setAttribute(
        "aScale",
        new THREE.InstancedBufferAttribute(new Float32Array(instScale), 3, false)
    );
    ins.setAttribute(
        "aPosition",
        new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3, false)
    );
    ins.setAttribute(
        "rotation",
        new THREE.InstancedBufferAttribute(new Float32Array(instRotate), 3, false)
    );
    
    const instEdges = new THREE.Mesh(ins, mat);
    scene.add(instEdges);
}

/**
 * Draws the quali st.zq in the center of the cuboid with width 0.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiUnitX(scene, st) {
    const quali = st.zq;
    const svg = SVG[quali].clone();
    // change size dependent on statement
    const size = Math.min(st.height(), st.depth());
    changeScale(svg, size, size);
    svg.rotateY(Math.PI / 2);

    // set position
    const dim = getDimensions(svg);
    const posX = st.x[0] + dim.box.min.x/2;
    const posY = st.y[0] + st.height()/2;
    const posZ = st.centerZ() + dim.depth/2;
    svg.position.set(posX, posY, posZ);

    svg.name = st.nameZQ();
    scene.add(svg);
}

/**
 * Draws the quali st.xq in the center of the cuboid with depth 0.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiUnitZ(scene, st) {
    const quali = st.xq;
    const svg = SVG[quali].clone();
    // change size dependent on statement
    const size = Math.min(st.width(), st.height());
    changeScale(svg, size, size);
            
    // set position
    const dim = getDimensions(svg);
    const posX = st.centerX() - dim.width/2;
    const posY = st.y[0] + st.height()/2;
    const posZ = st.z[1] + dim.box.min.z/2;
    svg.position.set(posX, posY, posZ);

    svg.name = st.nameXQ();
    scene.add(svg);
}

/**
 * Draws the quality st.zq on the ground on the z-axis.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiZ(scene, st) {
    const quali = st.zq;
    const svg = SVG[quali].clone();
        
    // change size dependent on statement
    const size = Math.min(st.width(), st.depth());
    changeScale(svg, size, size);

    // rotate on ground
    svg.rotateX(Math.PI / 2);

    // set position
    const dim = getDimensions(svg);
    const posX = st.x[0] + dim.box.min.x/2;
    const posY = st.y[0];
    const posZ = st.centerZ() + dim.depth/2;
    svg.position.set(posX, posY, posZ);

    svg.name = st.nameZQ();
    scene.add(svg);
}

/**
 * Draws the quality st.xq on the ground on the x-axis.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiX(scene, st) {
    const quali = st.xq;
    const svg = SVG[quali].clone();

    // change size dependent on statement
    const size = Math.min(st.width(), st.depth());
    changeScale(svg, size, size);

    // rotate on ground
    svg.rotateX(Math.PI / 2);

    // set position
    const dim = getDimensions(svg);
    const posX = st.centerX() - dim.width/2;
    const posY = st.y[0];
    const posZ = st.z[1] + dim.box.min.z/2;
    svg.position.set(posX, posY, posZ);

    svg.name = st.nameXQ();
    scene.add(svg);
}

//https://discourse.threejs.org/t/how-to-appoint-different-size-with-instancedbuffergeometry/27621

/**
 * Loads the svg from imgs/name.svg and places it using the callback planFn.
 * @param {string} name 
 */
function loadSVG(name) {
    const loader = new SVGLoader();
    const path = qualiToPath(name);
    loader.load(path, (data) => {
        // Set material for the paths
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const shape = data.paths[0].toShapes(true)[0];
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        const mesh = new THREE.Mesh(geometry, material);

        // resize it to a base size
        const dim = getDimensions(mesh)
        mesh.scale.set(1/dim.height*0.2, 1/dim.width*0.2, 0);
        if (name == C.ARB) {
            changeScale(mesh, 0.6, 1);
        }
        SVG[name] = mesh;
    });
};

/**
 * @typedef Dimensions
 * @property {THREE.Box3} box bounding box
 * @property {number} width
 * @property {number} height
 * @property {number} depth
 * 
 */

/**
 * 
 * @param {THREE.Group} svg 
 * @returns {Dimensions}
 */
function getDimensions(svg) {
    const box = new THREE.Box3().setFromObject(svg);
    return {
        box: box,
        width: box.max.x - box.min.x,
        height: box.max.y - box.min.y,
        depth: box.max.z - box.min.z
    };
}

/**
 * Resolves the name to a path.
 * @param {string} quali 
 * @returns {string}
 */
function qualiToPath(quali) {
    return `imgs/${quali}.svg`;
}

/**
 * Rescales the svg on x and y according to its params.
 * @param {THREE.Group} svg 
 * @param {number} sizeX 
 * @param {number} sizeY 
 */
function changeScale(svg, sizeX, sizeY) {
    const a = svg.scale;
    svg.scale.set(a.x*sizeX, a.y*sizeY, 0);
}
