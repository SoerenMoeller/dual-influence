import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader";

export function loadCuboidQualiX(scene, name) {
    const svg = loadSVG(name);
    scene.add(svg);

    let box = new THREE.Box3().setFromObject(svg);
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    console.log('Width:', width);
    svg.scale.set(1/height*0.3, 1/width*0.3, 0);
    svg.position.set(new THREE.Vector3(0, 0, 0));
}

function loadSVG(svg) {
    const loader = new SVGLoader();
    let group = new THREE.Group();
    loader.load(svg, (data) => {
        // Set material for the paths
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        // Add each path to the group
        data.paths.forEach((path) => {
            const shapes = path.toShapes(true);
            shapes.forEach((shape) => {
                const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            });
        });
        /*
        scene.add(group);
        let box = new THREE.Box3().setFromObject(group);
        let width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;
        console.log('Width:', width);
        group.scale.set(1/height*0.3, 1/width*0.3, 0);
        box = new THREE.Box3().setFromObject(group);
        width = box.max.x - box.min.x;
        group.rotateX(Math.PI / 2);
        group.translateX(0.5 - width/2);
        */
        //group.rotateX(Math.PI / 2);
        //group.rotateY(Math.PI);
        //group.translateY(0.2);
    });

    return group;
};
