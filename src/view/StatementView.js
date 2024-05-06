import * as THREE from "three";
import * as Constants from "../util/Constants.js";
import * as TypeDef from "../util/TypeDefs.js";


/**
 * Draws a statement as a box. 
 * To improve performance, InstancedMesh is used. In order to deal with 
 * unit intervals, the width/depth/height of the base can be 0.
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Statement} sts  
 * @param {number} baseWidth
 * @param {number} baseHeight  
 * @param {number} baseDepth 
 * @param {number} opacity 
 */
function drawStatement(scene, sts, baseWidth, baseHeight, baseDepth) {
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const materialBox = new THREE.MeshBasicMaterial( 
        {color: Constants.WHITE, opacity: 0, transparent: true, side: THREE.DoubleSide} 
    ); 
    const mesh = new THREE.InstancedMesh(baseGeometry, materialBox, sts.length);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < mesh.count; i++) {
        const st = sts[i];
        dummy.position.set(st.centerX(), st.centerY(), -st.centerZ());
        dummy.scale.set(st.width(), st.height(), st.depth());
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.name = "sts";
    scene.add(mesh);
}


/**
 * Draws the outlines of a statement. Generally it is a cuboid. 
 * To improve performance, InstancedBuffer is used. In order to deal with 
 * unit intervals, the width/depth/height of the base can be 0.
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Statement} sts  
 * @param {number} baseWidth
 * @param {number} baseHeight  
 * @param {number} baseDepth 
 */
function drawStatementEdges(scene, sts, baseWidth, baseHeight, baseDepth) {
    if (sts.length == 0) {
        return;
    }
    
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const edgesGeom = new THREE.EdgesGeometry(baseGeometry);
    const instancedGeom = new THREE.InstancedBufferGeometry().copy(edgesGeom);
    instancedGeom.instanceCount = sts.length;

    const instPos = [];
    const instScale = [];
    for (let i = 0; i < sts.length; i++) {
        const st = sts[i];
        instPos.push(st.centerX(), st.centerY(), -st.centerZ());
        instScale.push(st.width(), st.height(), st.depth());
    }

    instancedGeom.setAttribute(
        "aScale",
        new THREE.InstancedBufferAttribute(new Float32Array(instScale), 3, false)
    );
    instancedGeom.setAttribute(
        "aPosition",
        new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3, false)
    );

    const instMat = new THREE.LineBasicMaterial({
        color: Constants.BLACK, 
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-scale').textContent;
        }
    });
    
    const instEdges = new THREE.LineSegments(instancedGeom, instMat);
    scene.add(instEdges);
}


export { drawStatement, drawStatementEdges };