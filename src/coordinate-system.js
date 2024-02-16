import { Vector3, ArrowHelper } from 'three';


const COLOR = 0x000000;
const bDrawGrid = true;
const stepSize = 1;


const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


export function drawCoordinateSystem(scene, model) {
    const axes = [
        {dir: new Vector3(1, 0, 0), name: "lr"},
        {dir: new Vector3(0, 1, 0), name: "fb"},
        {dir: new Vector3(0, 0, 1), name: "to"}
    ]

    // extract bounds
    for (const axis of axes) {
        axis.minBound = Math.min(model.bounds[axis.name][0], -1);
        axis.maxBound = Math.max(model.bounds[axis.name][1], 1);
    }

    // draw axis
    for (const axis of axes) {
        // extract origin and length of arrow
        const origin = axis.dir.clone().multiplyScalar(axis.minBound);
        const length = axis.maxBound - axis.minBound;

        // TODO: Make arrow-head size universal?
        const arrow = new ArrowHelper(axis.dir, origin, length, COLOR, length*0.05);
        arrow.line.material.linewidth = 2;
        scene.add(arrow);
    }

    //drawGrid(scene, 20);
}

function drawGrid(scene, length) {
    const material = new THREE.LineDashedMaterial( {
        color: 0xffffff,
        linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
    });

    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );

    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    scene.add( line );
}
