import * as THREE from "three";
import * as TypeDef from "../util/TypeDefs";


/**
 * Draws a connector consisting of triangles. The values can be taken from the 
 * corner function (R, R) -> R
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Scheme} scheme 
 * @param {*} cornerFn TODO
 */
function drawConnector(scene, scheme, cornerFn) {
    const corners = []
    for (const st of scheme.statements.flat()) {
        if (!st.nonSingleton()) {
            continue;
        }

        const leftFront = cornerFn.get(st.x[0]).get(st.z[0]);
        const rightFront = cornerFn.get(st.x[1]).get(st.z[0]);
        const leftBack = cornerFn.get(st.x[0]).get(st.z[1]);
        const rightBack = cornerFn.get(st.x[1]).get(st.z[1]);

        if (isNaN(leftFront)|| isNaN(rightFront) || isNaN(leftBack) || isNaN(rightBack)) {
            continue;
        }

        corners.push(st.x[0], leftFront, -st.z[0]);
        corners.push(st.x[1], rightFront, -st.z[0]);
        corners.push(st.x[0], leftBack, -st.z[1]);

        corners.push(st.x[1], rightFront, -st.z[0]);
        corners.push(st.x[1], rightBack, -st.z[1]);
        corners.push(st.x[0], leftBack, -st.z[1]);
    }
    const vertices = new Float32Array(corners);

    // itemSize = 3 because there are 3 values (components) per vertex
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial( { color: 0x7b9dd4, side: THREE.DoubleSide, opacity: 0.6 } );
    const edges = new THREE.EdgesGeometry( geometry );
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );  
    const mesh = new THREE.Mesh( geometry, material );
    mesh.name = "connector-mesh";
    line.name = "connector-line";
    scene.add(mesh, line);
}


export { drawConnector };