import * as THREE from "three";
import * as C from "./constants.js"
import { SVGLoader } from "three/addons/loaders/SVGLoader";

export function drawCuboidQualiUnitX(scene, st) {
    const quali = st.zq;
    const placeSVG = (svg) => {
        // change size dependent on statement
        const size = Math.min(st.height(), st.depth());
        changeScale(svg, size, size);
        svg.rotateY(Math.PI / 2);

        const dim = getDimensions(svg);

        let offset = 0;
        if (quali == "arb" || quali == "const") {
            offset = -0.1;
        }
        svg.translateX(st.centerZ() - dim.width/2 + offset);
        svg.translateY(st.centerY());

        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

export function drawCuboidQualiUnitZ(scene, st) {
    const quali = st.xq;
    const placeSVG = (svg) => {
        // change size dependent on statement
        const size = Math.min(st.width(), st.height());
        changeScale(svg, size, size);
            
        const dim = getDimensions(svg);

        let offset = 0;
        if (quali == "arb" || quali == "const") {
            offset = -0.1;
        }
        svg.translateX(st.centerX() - dim.width/2 + offset);
        svg.translateY(st.centerY());

        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

export function drawCuboidQualiZ(scene, st) {
    const quali = st.zq;
    const placeSVG = (svg) => {
        // change size dependent on statement
        const size = Math.min(st.width(), st.depth());
        changeScale(svg, size, size);

        if (quali == "mono" || quali == "anti") {
            svg.translateZ(0.15);
        }

        // rotate on ground
        svg.rotateX(Math.PI / 2);

        // calculate position shift
        const dim = getDimensions(svg);
        const xPos = (st.z[1] + st.z[0]) / 2;
        let negativeArea = Math.min(0, st.z[1]) - Math.max(0, st.z[0]);
        let shift = xPos - negativeArea - dim.depth/2;

        // shift into position
        svg.translateX(dim.box.min.x - st.x[1]);
        svg.translateY(shift);
        svg.translateZ(-st.y[0]);
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

export function drawCuboidQualiX(scene, st) {
    const quali = st.xq;
    const placeSVG = (svg) => {
        // change size dependent on statement
        const size = Math.min(st.width(), st.depth());
        changeScale(svg, size, size);

        // rotate on ground
        svg.rotateX(Math.PI / 2);

        // calculate position shift
        const dim = getDimensions(svg);
        const xPos = (st.x[1] + st.x[0]) / 2;
        let negativeArea = Math.min(0, st.x[1]) - Math.max(0, st.x[0]);
        let shift = xPos - negativeArea - dim.width/2;

        // shift into position
        svg.translateX(shift);
        svg.translateY(dim.box.max.y + st.z[1] - dim.width/2);
        svg.translateZ(-st.y[0]);
        scene.add(svg);
    };

    loadSVG(quali, placeSVG);
}

function loadSVG(name, placeFn) {
    const loader = new SVGLoader();
    const group = new THREE.Group();
    const path = qualiToPath(name);
    loader.load(path, (data) => {
        // Set material for the paths
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        // Add each path to the group
        data.paths.forEach((path) => {
            const shapes = path.toShapes(true);
            shapes.forEach((shape) => {
                const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
            });
        });

        // resize it to a base size
        const dim = getDimensions(group)
        group.scale.set(1/dim.height*0.2, 1/dim.width*0.2, 0);
        if (name == "arb") {
            changeScale(group, 0.6, 1);
        }
        if (name == "arb" || name == "const") {
            group.translateZ(0.1);
        }

        placeFn(group);
    });
};

function getDimensions(svg) {
    const box = new THREE.Box3().setFromObject(svg);
    return {
        box: box,
        width: box.max.x - box.min.x,
        height: box.max.y - box.min.y,
        depth: box.max.z - box.min.z
    };
}

function qualiToPath(quali) {
    return `imgs/${quali}.svg`;
}

function changeScale(svg, sizeX, sizeY) {
    const a = svg.scale;
    svg.scale.set(a.x*sizeX, a.y*sizeY, 0);
}
