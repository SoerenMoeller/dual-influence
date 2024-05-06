import { SVGLoader } from "three/addons/loaders/SVGLoader";
import * as THREE from "three";
import * as Constants from "../util/Constants.js";
import * as TypeDef from "../util/TypeDefs.js";
import { splitScheme } from "../model/Scheme.js";

/**
 * Loads all svgs from imgs/ and visualizes the behaviors of given statements.
 * For performance reasons, the are clustered instead of drawing all individually.
 * 
 * This needs custom shaders, this helped me to get it going:
 * //https://discourse.threejs.org/t/how-to-appoint-different-size-with-instancedbuffergeometry/27621
 */

const SVG_BASESCALE = 0.00025;
const SVG = {};

/**
 * Loads all SVGs from assets/. Needs to be called once on initialization.
 */
function loadAllSVGs() {
    for (const quali of Constants.BEHAVIORS) {
        loadSVG(quali);
    }
}

/**
 * Draws the x-behavior of all statements in sts. Sts is supposed to only include
 * statements with a unit-interval on the z-axis.
 * @param {THREE.Scene} scene Scene to draw in.
 * @param {TypeDef.Statement[]} sts Statements to draw the qualities of.
 */
function drawUnitZBehaviors(scene, sts) {
    for (const behavior of Constants.BEHAVIORS) {
        const rotate = [0, 0, 0];
        if (behavior == Constants.MONO || behavior == Constants.ANTI) {
            rotate[2] = Math.PI/2;
        }
        const transform = {
            axis: "x",
            posX: (st, dim) => st.centerX() - dim.width/2,
            posY: (st, dim) => st.y[0] + st.height()/2,
            posZ: (st, dim) => -st.z[0],
            scale: (st) => Math.min(st.width(), st.height()),
            rotate: rotate
        }
    
        drawCuboidSVGs(scene, sts, behavior, transform);
    }
}

/**
 * Draws the z-quality of all statements in sts. Sts is supposed to only include
 * statements with a unit-interval on the x-axis.
 * @param {THREE.Scene} scene Scene to draw in.
 * @param {TypeDef.Statement[]} sts Statements to draw the qualities of.
 */
function drawUnitXBehaviors(scene, sts) {
    for (const behavior of Constants.BEHAVIORS) {
        const transform = {
            axis: "z",
            posX: (st, dim) => st.x[0] + dim.box.min.x/2,
            posY: (st, dim) => st.y[0] + st.height()/2,
            posZ: (st, dim) => -st.centerZ(),
            scale: (st) => Math.min(st.height(), st.depth()),
            rotate: [Math.PI, Math.PI/2, 0]
        }
    
        drawCuboidSVGs(scene, sts, behavior, transform);
    }
}

/**
 * Draws both behaviors of all statements in sts. Sts it expected to only 
 * include statements where the x- and z-axis are non-unit intervals.
 * @param {THREE.Scene} scene Scene to draw in. 
 * @param {*} sts Statements to draw the behaviors of.
 */
function drawNonUnitBehaviors(scene, sts) {
    const transformX = {
        axis: "x",
        posX: (st, dim) => st.centerX() - dim.width/2,
        posY: (st, dim) => st.y[0],
        posZ: (st, dim) => -st.z[0],
        scale: (st) => Math.min(st.width(), st.depth()),
        rotate: [Math.PI/2, 0, 0]
    }

    const transformZ = {
        axis: "z",
        posX: (st, dim) => st.x[0] + dim.box.min.x/2,
        posY: (st, dim) => st.y[0],
        posZ: (st, dim) => -(st.centerZ() + dim.depth/2),
        scale: (st) => Math.min(st.width(), st.depth()),
        rotate: [Math.PI/2, 0, 0]
    }
    
    for (const behavior of Constants.BEHAVIORS) {
        drawCuboidSVGs(scene, sts, behavior, transformX);
        drawCuboidSVGs(scene, sts, behavior, transformZ);
    }
}

/**
 * Draws a qualitiy `quali` into the scene. Additional drawing informations 
 * are included in `transform`. 
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Statement[]} sts 
 * @param {String} behavior 
 * @param {Object} transform 
 * @returns 
 */
function drawCuboidSVGs(scene, sts, behavior, transform) {
    sts = sts.filter((st) => st[transform.axis + "q"] == behavior);
    if (sts.length == 0) {
        return;
    }

    const instancedGeom = new THREE.InstancedBufferGeometry().copy(SVG[behavior].geometry);
    instancedGeom.instanceCount = sts.length;
    const material = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        color: Constants.BLACK,
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-rotate').textContent;
        } 
    });

    const instPos = [];
    const instScale = [];
    const instRotate = [];
    for (let i = 0; i < sts.length; i++) {
        const st = sts[i]
        const dim = getDimensions(SVG[behavior]);
        const posX = transform.posX(st, dim);
        const posY = transform.posY(st, dim);
        const posZ = transform.posZ(st, dim);

        instPos.push(posX, posY, posZ);
        instScale.push(SVG_BASESCALE*transform.scale(st), SVG_BASESCALE*transform.scale(st), 0);
        instRotate.push(...transform.rotate);
    }

    instancedGeom.setAttribute(
        "aScale",
        new THREE.InstancedBufferAttribute(new Float32Array(instScale), 3, false)
    );
    instancedGeom.setAttribute(
        "aPosition",
        new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3, false)
    );
    instancedGeom.setAttribute(
        "rotation",
        new THREE.InstancedBufferAttribute(new Float32Array(instRotate), 3, false)
    );
    
    const instMesh = new THREE.Mesh(instancedGeom, material);
    instMesh.name = "behavior";
    scene.add(instMesh);
}

/**
 * Loads the svg from imgs/name.svg and saves the Mesh in the SVG object.
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
        mesh.scale.set(SVG_BASESCALE, SVG_BASESCALE, 0);
        if (name == Constants.ARB) {
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
    return `../../${Constants.ASSETS_FOLDER}/${quali}.svg`;
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


/**
 * Draws the behaviors of the provided statements into the scene.
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Statement[]} statements 
 */
function drawBehaviors(scene, statements) {
    const sts = splitScheme(statements);
    drawUnitXBehaviors(scene, sts.unitX);
    drawUnitZBehaviors(scene, sts.unitZ);
    drawNonUnitBehaviors(scene, sts.nonUnit);
}

export { loadAllSVGs, drawBehaviors };