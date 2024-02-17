import { Vector3, ArrowHelper, BufferGeometry, Line, LineDashedMaterial } from 'three';


const COLOR = 0x000000;
const bDrawGrid = true;
const stepSize = 1;


const range = (start, stop, step = 1) => {
    return Array(Math.ceil((stop + 1 - start) / step)).fill(start).map((x, y) => x + y * step);
}

function createAxes(model) {
    const axes = [
        {dir: new Vector3(1, 0, 0), name: "x"},
        {dir: new Vector3(0, 1, 0), name: "y"},
        {dir: new Vector3(0, 0, 1), name: "z"}
    ];

    // extract bounds
    for (const axis of axes) {
        axis.minBound = Math.min(model.bounds[axis.name][0], 0) - 1;
        axis.maxBound = Math.max(model.bounds[axis.name][1], 0) + 1;
    }

    return axes;
}

function drawAxes(scene, axes) {
    for (const axis of axes) {
        // extract origin and length of arrow
        const origin = axis.dir.clone().multiplyScalar(axis.minBound);
        const length = axis.maxBound - axis.minBound;

        // TODO: Make arrow-head size universal?
        const arrow = new ArrowHelper(axis.dir, origin, length, COLOR, length*0.05);
        arrow.line.material.linewidth = 2;
        scene.add(arrow);
    }
}

export function drawCoordinateSystem(scene, model) {
    const axes = createAxes(model);
    drawAxes(scene, axes);
    drawGrid(scene, axes);
}

function drawGrid(scene, axes) {
    const [xAxis, yAxis, zAxis] = axes;
    drawGridDimension(scene, xAxis, yAxis, zAxis);
    drawGridDimension(scene, yAxis, zAxis, xAxis);
    drawGridDimension(scene, zAxis, xAxis, yAxis);
}

function drawGridDimension(scene, axisA, axisB, axisC) {
    for (const valB of range(axisB.minBound, axisB.maxBound, stepSize)) {
        for (const valC of range(axisC.minBound, axisC.maxBound, stepSize)) {
            const offsetB = axisB.dir.clone().multiplyScalar(valB);
            const offsetC = axisC.dir.clone().multiplyScalar(valC);
            offsetB.add(offsetC);
            drawDottedLine(scene, axisA, offsetB);
        }    
    }
}

function drawDottedLine(scene, axis, offset) {
    if (offset.equals(new Vector3(0, 0, 0))) {
        return;
    }

    const material = new LineDashedMaterial( {
        color: 0xd3d3d3,
        linewidth: 0.1,
        scale: 1,
        dashSize: 0.025,
        gapSize: 0.05,
    });

    const startPoint = axis.dir.clone().multiplyScalar(axis.minBound).add(offset);
    const endPoint = axis.dir.clone().multiplyScalar(axis.maxBound).add(offset);

    const geometry = new BufferGeometry().setFromPoints( [startPoint, endPoint] );
    const line = new Line( geometry, material );
    line.computeLineDistances();

    scene.add( line );
}
