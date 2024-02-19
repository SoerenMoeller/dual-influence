import * as THREE from "three";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

/**
 * Draws the coordinate system.
 * @param {THREE.Scene} scene 
 * @param {typedef.Scheme} scheme 
 */
export function drawCS(scene, scheme) {
    const axes = createAxes(scheme);
    drawAxes(scene, axes);
}

/**
 * Draws a grid.
 * @param {THREE.Scene} scene 
 * @param {typedef.Scheme} scheme 
 * @param {number} stepSize
 */
export function drawGrid(scene, scheme, stepSize) {
    const [xAxis, yAxis, zAxis] = createAxes(scheme);
    const container = new THREE.Group();

    drawGridDimension(container, stepSize, xAxis, yAxis, zAxis);
    drawGridDimension(container, stepSize, yAxis, zAxis, xAxis);
    drawGridDimension(container, stepSize, zAxis, xAxis, yAxis);
    
    container.name = "grid";
    scene.add(container);
}

/**
 * Creates data about axes. Includes name, direction and the bounds.
 * @param {typedef.Scheme} scheme 
 * @returns {typedef.Axis[]}
 */
function createAxes(model) {
    const axes = [
        {dir: new THREE.Vector3(1, 0, 0), name: "x"},
        {dir: new THREE.Vector3(0, 1, 0), name: "y"},
        {dir: new THREE.Vector3(0, 0, 1), name: "z"}
    ];

    // extract bounds
    for (const axis of axes) {
        axis.minBound = Math.min(model.bounds[axis.name][0], 0) - 1;
        axis.maxBound = Math.max(model.bounds[axis.name][1], 0) + 1;
    }

    return axes;
}

/**
 * Draw the axis as arrows.
 * @param {THREE.Scene} scene 
 * @param {typedef.Axis[]} axes 
 */
function drawAxes(scene, axes) {
    for (const axis of axes) {
        // extract origin and length of arrow
        const origin = axis.dir.clone().multiplyScalar(axis.minBound);
        const length = axis.maxBound - axis.minBound;

        // TODO: Make arrow-head size universal?
        const arrow = new THREE.ArrowHelper(axis.dir, origin, length, C.BLACK, length*0.05);
        arrow.line.material.linewidth = 2;
        arrow.name = `${axis.name}-axis`;
        scene.add(arrow);
    }
}

/**
 * Creates range array.
 * @param {number} start 
 * @param {number} stop 
 * @param {number} step 
 * @returns {number[]}
 */
function range(start, stop, step = 1) {
    return Array(Math.ceil((stop + 1 - start) / step))
        .fill(start)
        .map((x, y) => x + y * step);
}

/**
 * Draws all grid lines parallel to axisA with distance stepSize.
 * @param {THREE.Group} container 
 * @param {number} stepSize
 * @param {typedef.Axis} axisA 
 * @param {typedef.Axis} axisB 
 * @param {typedef.Axis} axisC 
 */
function drawGridDimension(container, stepSize, axisA, axisB, axisC) {
    for (const valB of range(axisB.minBound, axisB.maxBound, stepSize)) {
        for (const valC of range(axisC.minBound, axisC.maxBound, stepSize)) {
            const offsetB = axisB.dir.clone().multiplyScalar(valB);
            const offsetC = axisC.dir.clone().multiplyScalar(valC);
            offsetB.add(offsetC);
            drawDottedLine(container, axisA, offsetB);
        }    
    }
}

/**
 * Draws a dotted line in parallel to axis according to the offset.
 * @param {THREE.Group} container 
 * @param {typedef.Axis} axis 
 * @param {THREE.Vector3} offset 
 */
function drawDottedLine(container, axis, offset) {
    if (offset.equals(new THREE.Vector3(0, 0, 0))) {
        return;
    }

    const material = new THREE.LineDashedMaterial( {
        color: C.LIGHT_GREY,
        linewidth: 0.1,
        scale: 1,
        dashSize: 0.025,
        gapSize: 0.05,
    });

    const startPoint = axis.dir.clone().multiplyScalar(axis.minBound).add(offset);
    const endPoint = axis.dir.clone().multiplyScalar(axis.maxBound).add(offset);

    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();

    container.add(line);
}
