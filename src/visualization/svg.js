import { SVGLoader } from "three/addons/loaders/SVGLoader";
import * as THREE from "three";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

/**
 * Draws the quali st.zq in the center of the cuboid with width 0.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiUnitX(scene, st) {
    const quali = st.zq;
    const placeSVG = (svg) => {
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

        svg.name = `${st.name()}qz`;
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

/**
 * Draws the quali st.xq in the center of the cuboid with depth 0.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiUnitZ(scene, st) {
    const quali = st.xq;
    const placeSVG = (svg) => {
        // change size dependent on statement
        const size = Math.min(st.width(), st.height());
        changeScale(svg, size, size);
            
        // set position
        const dim = getDimensions(svg);
        const posX = st.centerX() - dim.width/2;
        const posY = st.y[0] + st.height()/2;
        const posZ = st.z[1] + dim.box.min.z/2;
        svg.position.set(posX, posY, posZ);

        svg.name = `${st.name()}qx`;
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

/**
 * Draws the quality st.zq on the ground on the z-axis.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiZ(scene, st) {
    const quali = st.zq;
    const placeSVG = (svg) => {
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

        svg.name = `${st.name()}qz`;
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

/**
 * Draws the quality st.xq on the ground on the x-axis.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function drawCuboidQualiX(scene, st) {
    const quali = st.xq;
    const placeSVG = (svg) => {
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

        svg.name = `${st.name()}qx`;
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

/**
 * Loads the svg from imgs/name.svg and places it using the callback planFn.
 * @param {string} name 
 * @callback placeFn Should place the svg in the scene.
 */
function loadSVG(name, placeFn) {
    const loader = new SVGLoader();
    const group = new THREE.Group();
    const path = qualiToPath(name);
    loader.load(path, (data) => {
        // Set material for the paths
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Add each path to the group
        data.paths.forEach((path) => {
            const shapes = path.toShapes(true);
            shapes.forEach((shape) => {
                const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            });
        });

        // resize it to a base size
        const dim = getDimensions(group)
        group.scale.set(1/dim.height*0.2, 1/dim.width*0.2, 0);
        if (name == C.ARB) {
            changeScale(group, 0.6, 1);
        }

        placeFn(group);
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
