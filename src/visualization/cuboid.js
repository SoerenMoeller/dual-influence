import * as THREE from "three";
import * as SVG from "./svg.js";
import * as C from "../constants.js";
import * as typedef from "../typedefs.js";

function drawCuboid(scene, sts, baseGeometry, opacity) {
    const materialBox = new THREE.MeshBasicMaterial( {color: C.WHITE, opacity: opacity, transparent: true} ); 
    const mesh = new THREE.InstancedMesh(baseGeometry, materialBox, sts.length);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < mesh.count; i++) {
        const st = sts[i];
        dummy.position.set(st.centerX(), st.centerY(), st.centerZ());
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
}

function drawCuboidEdges(scene, sts, baseGeometry) {
    if (sts.length == 0) {
        return;
    }
    console.log(sts);
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
    const sts = scheme.statements;
    const cuboidSts = sts.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height != 0});
    const cuboidStsHeight = sts.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height == 0});
    const xUnitSts = sts.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height != 0});
    const xUnitStsHeight = sts.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height == 0});
    const yUnitSts = sts.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height != 0});
    const yUnitStsHeight = sts.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height == 0});
    const dotSts = sts.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height != 0});
    const dotStsHeight = sts.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height == 0});

    drawCuboidEdges(scene, cuboidSts, new THREE.BoxGeometry(1, 1, 1));
    drawCuboidEdges(scene, cuboidStsHeight, new THREE.BoxGeometry(1, 0, 1));
    drawCuboidEdges(scene, xUnitSts, new THREE.BoxGeometry(0, 1, 1));
    drawCuboidEdges(scene, xUnitStsHeight, new THREE.BoxGeometry(0, 0, 1));
    drawCuboidEdges(scene, yUnitSts, new THREE.BoxGeometry(1, 1, 0));
    drawCuboidEdges(scene, yUnitStsHeight, new THREE.BoxGeometry(1, 0, 0));
    drawCuboidEdges(scene, dotSts, new THREE.BoxGeometry(0, 1, 0));
    drawCuboidEdges(scene, dotStsHeight, new THREE.BoxGeometry(0, 0, 0));
    drawCuboid(scene, cuboidSts, new THREE.BoxGeometry(1, 1, 1), opacity);
    drawCuboid(scene, cuboidStsHeight, new THREE.BoxGeometry(1, 0, 1), opacity);
    drawCuboid(scene, xUnitSts, new THREE.BoxGeometry(0, 1, 1), opacity);
    drawCuboid(scene, xUnitStsHeight, new THREE.BoxGeometry(0, 0, 1), opacity);
    drawCuboid(scene, yUnitSts, new THREE.BoxGeometry(1, 1, 0), opacity);
    drawCuboid(scene, yUnitStsHeight, new THREE.BoxGeometry(1, 0, 0), opacity);
    drawCuboid(scene, dotSts, new THREE.BoxGeometry(0, 1, 0), opacity);
    drawCuboid(scene, dotStsHeight, new THREE.BoxGeometry(0, 0, 0), opacity);

    //SVG.drawCuboidQualities(sts, cuboidSts);
    
    return;
    const baseGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))
    const instancedGeom = new THREE.InstancedBufferGeometry().copy(baseGeom)
    instancedGeom.instanceCount = sts.length;

    const instPos = [];
    const instScale =[];
    let colorArr = [];
    for (let i = 0; i < 4; i++) {
        const st = sts[i];
        instPos.push(st.centerX(), st.centerY(), st.centerZ());
        instScale.push(st.width(), st.height(), st.depth());
    }
    instancedGeom.setAttribute(
        'aScale',
        new THREE.InstancedBufferAttribute(new Float32Array(instScale), 3, false));
        instancedGeom.setAttribute(
        'aPosition',
        new THREE.InstancedBufferAttribute(new Float32Array(instPos), 3, false));

    const instMat = new THREE.LineBasicMaterial({
        color: 0x000000, 
        onBeforeCompile: shader => {
            shader.vertexShader = document.getElementById('vertex-shader-scale').textContent;
        }
    });
    
    var instLines = new THREE.LineSegments(instancedGeom, instMat);
    scene.add(instLines);

    return;


    const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            lightDirection: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() }
          },
          fragmentShader: document.getElementById('fragment-shader').textContent,
          vertexShader: document.getElementById('vertex-shader').textContent,
          transparent: true
        })
    const materialScale = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            lightDirection: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() }
          },
          fragmentShader: document.getElementById('fragment-shader').textContent,
          vertexShader: document.getElementById('vertex-shader-scale').textContent
        })
    
    baseGeom = new THREE.SphereGeometry(20, 32, 16)
    instancedGeom = new THREE.InstancedBufferGeometry().copy(baseGeom)
    instancedGeom.instanceCount = 10
    
    colorArr = []
    const posArr = []
    for(let i = 0;i < 100;i++){
      new THREE.Color(0xFF00FF).toArray(colorArr, i*3)
      posArr.push(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200)
    }
    
    instancedGeom.setAttribute(
          'aColor',
          new THREE.InstancedBufferAttribute(new Float32Array(colorArr), 3, false)
        )
    instancedGeom.setAttribute(
          'aPosition',
          new THREE.InstancedBufferAttribute(new Float32Array(posArr), 3, false))
    
    scene.add(new THREE.Mesh(instancedGeom, material))
    scene.add(new THREE.Mesh(instancedGeom, materialScale))
    
    animate()
    
    function animate(){
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      controls.update()
    }
}

/**
 * Draws all statements.
 * @param {THREE.Scene} scene 
 * @param {typedef.Scheme[]} scheme 
 */
export function drawScheme2(scene, scheme, opacity) {
    const sts = scheme.statements.filter((e) => {return e.width() != 0 && e.depth() != 0});
    var boxEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
    var instGeom = new THREE.InstancedBufferGeometry().copy(boxEdges);
    var instOffset = [];
    for (let i = 0; i <= 3; i++){
        const st = sts[i];
        instOffset.push(st.centerX(), st.centerY(), st.centerZ());
    }
    const instScale = [];
    for (let i = 0; i <= 3; i++){
        const st = sts[i];
        instScale.push(2, st.height(), st.depth());
    }
    console.log(instScale);
    instGeom.setAttribute("translate", new THREE.InstancedBufferAttribute(new Float32Array(instScale), 3))
    instGeom.setAttribute("offset", new THREE.InstancedBufferAttribute(new Float32Array(instOffset), 3));
    instGeom.instanceCount = Infinity;
    //console.log(instGeom);

    var instMat = new THREE.LineBasicMaterial({
        color: 0x000000, 
    onBeforeCompile: shader => {
        //console.log(shader.vertexShader);
        shader.vertexShader = `
            attribute vec3 offset;
        ${shader.vertexShader}
        `.replace(
            `#include <begin_vertex>`,
        `
        #include <begin_vertex>
        transformed += offset;
        `
        );
        //console.log(shader.vertexShader);
    }
    });

    var instLines = new THREE.LineSegments(instGeom, instMat);
    scene.add(instLines);

    return;
    console.log(sts);
    const geometryBox = new THREE.BoxGeometry(1, 1, 1);
    const materialBox = new THREE.MeshBasicMaterial( {color: C.WHITE, opacity: opacity, transparent: true} ); 
    const geometryEdges = new THREE.EdgesGeometry( geometryBox );
    const materialEdges = new THREE.LineBasicMaterial( {color: C.RED} );
    const mesh = new THREE.InstancedMesh(geometryBox, materialBox, 4);
    const edges = new THREE.InstancedBufferGeometry(geometryEdges, materialEdges, 4);
    debugger;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < mesh.count; i++) {
        const st = sts[i];
        console.log(st.x, st.y, st.z);
        console.log(st.width()/2, st.height()/2, st.depth()/2);
        dummy.position.set(st.centerX(), st.centerY(), st.centerZ());
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
        edges.setMatrixAt( i, dummy.matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;
    edges.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
    scene.add(edges);

    return;
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
function drawCuboid2(scene, st, opacity) {
    if (st.width() !== 0 || st.depth() !== 0) {
        if (JSON.stringify(st.y) == JSON.stringify([-Infinity, Infinity])) {
            const geometry = new THREE.BoxGeometry( 
                st.x[1] - st.x[0], 
                2, 
                st.z[1] - st.z[0]
            ); 
            
            const material2 = new THREE.MeshBasicMaterial( {color: C.RED, opacity: opacity, transparent: true} ); 
            const cube = new THREE.Mesh( geometry, material2 ); 
    
            const edgesGeometry = new THREE.EdgesGeometry( geometry );
            const material = new THREE.LineBasicMaterial( {color: C.RED} );
            const edges = new THREE.LineSegments( edgesGeometry, material );
    
            // shift the statement into the correct position
            edges.translateX(st.width()/2 + st.x[0]);
            edges.translateY(st.height()/2 - 1);
            edges.translateZ(st.depth()/2 + st.z[0]);
    
            cube.translateX(st.width()/2 + st.x[0]);
            cube.translateY(st.height()/2 - 1);
            cube.translateZ(st.depth()/2 + st.z[0]);
    
            edges.name = st.name();
            cube.name = st.nameC();
            scene.add(edges);
            scene.add(cube);
        } else {
            const geometry = new THREE.BoxGeometry( 
                st.x[1] - st.x[0], 
                st.y[1] - st.y[0], 
                st.z[1] - st.z[0]
            ); 
            
            const material2 = new THREE.MeshBasicMaterial( {color: C.WHITE, opacity: opacity, transparent: true} ); 
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
        }
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
