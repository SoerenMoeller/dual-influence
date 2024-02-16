import * as THREE from 'three';


export function drawCuboid(scene) {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
    const edgesGeometry = new THREE.EdgesGeometry( geometry );
    const material = new THREE.LineBasicMaterial( {color: 0x000000} );
    const edges = new THREE.LineSegments( edgesGeometry, material );
    scene.add( edges );
}
