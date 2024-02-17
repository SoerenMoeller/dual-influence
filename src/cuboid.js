import * as THREE from 'three';
import { drawCuboidQualiX, drawCuboidQualiZ } from './svg.js'


export function drawCuboid(scene, st) {
    const geometry = new THREE.BoxGeometry( 
        st.x[1] - st.x[0], 
        st.y[1] - st.y[0], 
        st.z[1] - st.z[0]
    ); 
    const edgesGeometry = new THREE.EdgesGeometry( geometry );
    const material = new THREE.LineBasicMaterial( {color: 0x000000} );
    const edges = new THREE.LineSegments( edgesGeometry, material );

    const height = geometry.parameters.height;
    const width = geometry.parameters.width;
    const depth = geometry.parameters.depth;
    edges.translateX(width/2 + st.x[0]);
    edges.translateY(height/2 + st.y[0]);
    edges.translateZ(depth/2 + st.z[0]);
    scene.add(edges);

    if (width != 0 && depth != 0) {
        drawCuboidQualiX(scene, st.xq, st);
        drawCuboidQualiZ(scene, st.xq, st);
    }
}
