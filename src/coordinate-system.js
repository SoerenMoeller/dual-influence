import * as THREE from 'three';


const COLOR = 0x000000;


const range = (start, stop, step = 1) =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


export function drawCoordinateSystem(scene) {
    const origin = new THREE.Vector3(0, 0, 0);
    const xDir = new THREE.Vector3(1, 0, 0);
    const zDir = new THREE.Vector3(0, 1, 0);
    const yDir = new THREE.Vector3(0, 0, 1);
    const axisPoints = [xDir, yDir, zDir]

    for (const dir of axisPoints) {
        const length = 20;
        const arrow = new THREE.ArrowHelper( dir, origin, length, COLOR, length*0.05);
        arrow.line.material.linewidth = 2;
        scene.add( arrow );
    }

    drawGrid(scene, 20);
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
