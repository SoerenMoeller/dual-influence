import * as THREE from "three";
import * as SVG from "./svg.js";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

/**
 * Draws all statements.
 * @param {THREE.Scene} scene 
 * @param {typedef.Scheme[]} scheme 
 */
export function drawScheme(scene, scheme, opacity) {
    for (const st of scheme.statements.flat()) {
        drawCuboid(scene, st, opacity);
    }
}

/**
 * Draws a statement as a cuboid. Also draws the qualities on the bottom.
 * If one is a unit interval, the qualitiy is depicted in the center.
 * @param {THREE.Scene} scene 
 * @param {typedef.Statement} st 
 */
function drawCuboid(scene, st, opacity) {
    if (st.width() !== 0 || st.depth() !== 0) {
        const geometry = new THREE.BoxGeometry( 
            st.x[1] - st.x[0], 
            st.y[1] - st.y[0], 
            st.z[1] - st.z[0]
        ); 
        
        const material2 = new THREE.MeshBasicMaterial( {color: 0xffffff, opacity: opacity, transparent: true} ); 
        const cube = new THREE.Mesh( geometry, material2 ); 

        const edgesGeometry = new THREE.EdgesGeometry( geometry );
        const material = new THREE.LineBasicMaterial( {color: C.BLACK} );
        const edges = new THREE.LineSegments( edgesGeometry, material );

        // shift the statement into the correct position
        edges.translateX(st.width()/2 + st.x[0]);
        edges.translateY(st.height()/2 + st.y[0]);
        edges.translateZ(st.depth()/2 + st.z[0]);

        cube.translateX(st.width()/2 + st.x[0]);
        cube.translateY(st.height()/2 + st.y[0]);
        cube.translateZ(st.depth()/2 + st.z[0]);

        edges.name = st.name();
        cube.name = st.nameC();
        scene.add(edges);
        scene.add(cube);
    } else {
        // TODO: ugly if-else
        if (JSON.stringify(st.y) == JSON.stringify([-Infinity, Infinity])) {
            const material = new THREE.LineBasicMaterial( { color: C.RED });
    
            const startPoint = new THREE.Vector3(st.x[0], 1, st.z[0]);
            const endPoint = new THREE.Vector3(st.x[0], -1, st.z[0]);
        
            const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
            const line = new THREE.Line(geometry, material);
            line.name = st.name();
            scene.add(line);
        } else {
            const material = new THREE.LineBasicMaterial( { color: C.BLACK });
    
            const startPoint = new THREE.Vector3(st.x[0], st.y[0], st.z[0]);
            const endPoint = new THREE.Vector3(st.x[0], st.y[1], st.z[0]);
        
            const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
            const line = new THREE.Line(geometry, material);
            line.name = st.name();
            scene.add(line);
        }
        
    }

    
    if (st.width() != 0 && st.depth() != 0) {
        SVG.drawCuboidQualiX(scene, st);
        SVG.drawCuboidQualiZ(scene, st);
    }
    
    if (st.width() == 0 && st.depth() != 0) {
        SVG.drawCuboidQualiUnitX(scene, st);
    }
        
    if (st.width() != 0 && st.depth() == 0) {
        SVG.drawCuboidQualiUnitZ(scene, st);
    }
}
