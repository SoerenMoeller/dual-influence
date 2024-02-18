import * as THREE from "three";
import * as SVG from "./svg.js";
import * as typedef from "./typedefs.js";

/**
 * Draws a statement as a cuboid. Also draws the qualities on the bottom.
 * If one is a unit interval, the qualitiy is depicted in the center.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
export function draw(scene, st) {
    const geometry = new THREE.BoxGeometry( 
        st.x[1] - st.x[0], 
        st.y[1] - st.y[0], 
        st.z[1] - st.z[0]
    ); 
    const edgesGeometry = new THREE.EdgesGeometry( geometry );
    const material = new THREE.LineBasicMaterial( {color: 0x000000} );
    const edges = new THREE.LineSegments( edgesGeometry, material );

    // shift the statement into the correct position
    const height = geometry.parameters.height;
    const width = geometry.parameters.width;
    const depth = geometry.parameters.depth;
    edges.translateX(width/2 + st.x[0]);
    edges.translateY(height/2 + st.y[0]);
    edges.translateZ(depth/2 + st.z[0]);
    scene.add(edges);

    if (width != 0 && depth != 0) {
        SVG.drawCuboidQualiX(scene, st);
        SVG.drawCuboidQualiZ(scene, st);
    }

    if (width == 0 && depth != 0) {
        SVG.drawCuboidQualiUnitX(scene, st);
    }

    if (width != 0 && depth == 0) {
        SVG.drawCuboidQualiUnitZ(scene, st);
    }
}

/*

,
        {
            "x": [-16, -10.5],
            "z": [-11, -8],
            "y": [-1.5, 1],
            "xq": "anti",
            "zq": "anti"
        },
        {
            "x": [-16, -12],
            "z": [-8.5, -5],
            "y": [-1.5, 0.5],
            "xq": "anti",
            "zq": "mono"
        },
        {
            "x": [-16, -11.5],
            "z": [-4.5, 0],
            "y": [-1, 2.5],
            "xq": "arb",
            "zq": "mono"
        } 

        */