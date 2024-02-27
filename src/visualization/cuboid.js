import * as THREE from "three";
import * as SVG from "./svg.js";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

function drawCuboid(scene, sts, baseGeometry, opacity, name) {
    const materialBox = new THREE.MeshBasicMaterial( {color: C.WHITE, opacity: opacity, transparent: true} ); 
    const mesh = new THREE.InstancedMesh(baseGeometry, materialBox, sts.length);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < mesh.count; i++) {
        const st = sts[i];
        dummy.position.set(st.centerX(), st.centerY(), st.centerZ());
        dummy.scale.set(st.width(), st.height(), st.depth());
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.name = name;
    scene.add(mesh);
}

function drawCuboidEdges(scene, sts, baseGeometry) {
    if (sts.length == 0) {
        return;
    }
    
    const edgesGeom = new THREE.EdgesGeometry(baseGeometry);
    const instancedGeom = new THREE.InstancedBufferGeometry().copy(edgesGeom);
    instancedGeom.instanceCount = sts.length;

    const instPos = [];
    const instScale =[];
    for (let i = 0; i < sts.length; i++) {
        const st = sts[i];
        instPos.push(st.centerX(), st.centerY(), st.centerZ());
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
        color: 0x000000, 
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-scale').textContent;
        }
    });
    
    const instEdges = new THREE.LineSegments(instancedGeom, instMat);
    scene.add(instEdges);
}

export function drawScheme(scene, scheme, opacity) {
    // I rescale a box with width=height=depth=1. Since unit intervals exist,
    // I have to make a distinction if an axis is a unit interval.
    const sts = scheme.statements.flat();
    const cuboidSts = sts.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height() != 0});
    const cuboidStsHeight = sts.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height() == 0});
    const xUnitSts = sts.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height() != 0});
    const xUnitStsHeight = sts.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height() == 0});
    const yUnitSts = sts.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height() != 0});
    const yUnitStsHeight = sts.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height() == 0});
    const dotSts = sts.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height() != 0});
    const dotStsHeight = sts.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height() == 0});
    
    drawCuboidEdges(scene, cuboidSts, new THREE.BoxGeometry(1, 1, 1));
    drawCuboidEdges(scene, cuboidStsHeight, new THREE.BoxGeometry(1, 0, 1));
    drawCuboidEdges(scene, xUnitSts, new THREE.BoxGeometry(0, 1, 1));
    drawCuboidEdges(scene, xUnitStsHeight, new THREE.BoxGeometry(0, 0, 1));
    drawCuboidEdges(scene, yUnitSts, new THREE.BoxGeometry(1, 1, 0));
    drawCuboidEdges(scene, yUnitStsHeight, new THREE.BoxGeometry(1, 0, 0));
    drawCuboidEdges(scene, dotSts, new THREE.BoxGeometry(0, 1, 0));
    drawCuboidEdges(scene, dotStsHeight, new THREE.BoxGeometry(0, 0, 0));
    
    drawCuboid(scene, cuboidSts, new THREE.BoxGeometry(1, 1, 1), opacity, "cuboidSts");
    drawCuboid(scene, xUnitSts, new THREE.BoxGeometry(0, 1, 1), opacity, "xUnitSts");
    drawCuboid(scene, yUnitSts, new THREE.BoxGeometry(1, 1, 0), opacity, "yUnitSts");
    drawCuboid(scene, cuboidStsHeight, new THREE.BoxGeometry(1, 0, 1), opacity, "cuboidStsHeight");

    drawBehaviors(scene, sts);
}

export function drawBehaviors(scene, sts) {
    const cuboidSts = sts.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height() != 0});
    const xUnitSts = sts.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height() != 0});
    const yUnitSts = sts.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height() != 0});

    SVG.drawCuboidQualities(scene, cuboidSts);
    SVG.drawUnitXQualities(scene, xUnitSts);
    SVG.drawUnitZQualities(scene, yUnitSts);
}
