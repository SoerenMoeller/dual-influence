import { Vector3, ArrowHelper, BufferGeometry, Line, LineDashedMaterial } from 'three';


const COLOR = 0x000000;
const bDrawGrid = true;
const stepSize = 1;


const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop + 1 - start) / step)).fill(start).map((x, y) => x + y * step)

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
    for (const xVal of range(xAxis.minBound, xAxis.maxBound, stepSize)) {
        for (const yVal of range(yAxis.minBound, yAxis.maxBound, stepSize)) {
            for (const zVal of range(zAxis.minBound, zAxis.maxBound, stepSize)) {
                if (xVal == xAxis.minBound) {
                    drawDottedLine(scene, xAxis, xVal, yVal, zVal);
                }

                if (yVal == yAxis.minBound) {
                    drawDottedLine(scene, yAxis, xVal, yVal, zVal);
                }

                if (zVal == zAxis.minBound) {
                    drawDottedLine(scene, zAxis, xVal, yVal, zVal);
                }
            }
        } 
    }
}


function drawDottedLine(scene, axis, xVal, yVal, zVal) {
    const material = new LineDashedMaterial( {
        color: 0xd3d3d3,
        linewidth: 0.1,
        scale: 1,
        dashSize: 0.025,
        gapSize: 0.05,
    });

    let offset;
    if (axis.name == "x") {
        const yOffset = new Vector3(0, 1, 0).multiplyScalar(yVal);
        const zOffset = new Vector3(0, 0, 1).multiplyScalar(zVal);
        offset = yOffset.add(zOffset);
    } else if (axis.name == "y") {
        const xOffset = new Vector3(1, 0, 0).multiplyScalar(xVal);
        const zOffset = new Vector3(0, 0, 1).multiplyScalar(zVal);
        offset = xOffset.add(zOffset);
    } else if (axis.name == "z") {
        const xOffset = new Vector3(1, 0, 0).multiplyScalar(xVal);
        const yOffset = new Vector3(0, 1, 0).multiplyScalar(yVal);
        offset = xOffset.add(yOffset);
    }

    const startPoint = axis.dir.clone().multiplyScalar(axis.minBound).add(offset);
    const endPoint = axis.dir.clone().multiplyScalar(axis.maxBound).add(offset);

    const geometry = new BufferGeometry().setFromPoints( [startPoint, endPoint] );
    const line = new Line( geometry, material );
    line.computeLineDistances();

    scene.add( line );
}
