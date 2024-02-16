import * as THREE from 'three';


const MATERIAL = new THREE.LineBasicMaterial( { color: 0x000000 } );


export function drawCoordinateSystem(scene) {
    const xMax = new THREE.Vector3(20, 0, 0);
    const zMax = new THREE.Vector3(0, 0, 20);
    const yMax = new THREE.Vector3(0, 20, 0);
    const axisPoints = [xMax, yMax, zMax]

    for (const point of axisPoints) {
        const geometry = new THREE.BufferGeometry().setFromPoints([point.clone().negate(), point]);
        const line = new THREE.Line( geometry, MATERIAL );
        scene.add( line );
    }
}