import { Vector3, ArrowHelper } from 'three';


const COLOR = 0x000000;


const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


export function drawCoordinateSystem(scene, model) {
    const axes = [
        {dir: new Vector3(1, 0, 0), name: "lr"},
        {dir: new Vector3(0, 1, 0), name: "fb"},
        {dir: new Vector3(0, 0, 1), name: "to"}
    ]

    for (const axis of axes) {
        // extract bounds
        const minBound = Math.min(model.bounds[axis.name][0], -1);
        const maxBound = Math.max(model.bounds[axis.name][1], 1);

        // extract origin and length of arrow
        const origin = axis.dir.clone().multiplyScalar(minBound);
        const length = maxBound - minBound;

        // TODO: Make arrow-head size universal?
        const arrow = new ArrowHelper(axis.dir, origin, length, COLOR, length*0.05);
        arrow.line.material.linewidth = 2;
        scene.add(arrow);
    }

    //drawGrid(scene, 20);
}

function getBounds(model) {
    const sts = model.statements;
    return {
        lr: [sts.map(x => x.lr[0]), sts.map(x => x.lr[1])],
        fb: [sts.map(x => x.lr[0]), sts.map(x => x.fb[1])],
        to: [sts.map(x => x.lr[0]), sts.map(x => x.to[1])]
    };
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
