import * as THREE from "three";

export function draw(scene, scheme, cornerFn) {
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
            console.log("error");
            continue;
        }

        corners.push(st.x[0], leftFront, -st.z[0]);
        corners.push(st.x[1], rightFront, -st.z[0]);
        corners.push(st.x[0], leftBack, -st.z[1]);

        corners.push(st.x[1], rightFront, -st.z[0]);
        corners.push(st.x[1], rightBack, -st.z[1]);
        corners.push(st.x[0], leftBack, -st.z[1]);
    }
    console.log(corners);
    const vertices = new Float32Array(corners);

    // itemSize = 3 because there are 3 values (components) per vertex
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
    const mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
}