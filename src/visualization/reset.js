export function changeOpacity(scene, opacity) {
    const statementTypes = ["cuboidSts", "xUnitSts", "yUnitSts", "cuboidStsHeight"];
    for (const type of statementTypes) {
        const sts = scene.getObjectByName(type);
        if (sts !== undefined) {
            sts.material.opacity = opacity;
        }
    }
}

export function resetScheme(scene) {
    scene.clear();
}

export function resetGrid(scene) {
    const grid = scene.getObjectByName("grid");
    if (grid !== undefined) {
        scene.remove(grid);
    }
}

export function resetBehaviors(scene) {
    let svg = scene.getObjectByName("behavior");
    while (svg !== undefined) {
        scene.remove(svg);
        svg = scene.getObjectByName("behavior");
    }
}

export function resetConnector(scene) {
    const mesh = scene.getObjectByName("connector-mesh");
    const line = scene.getObjectByName("connector-line");
    if (mesh !== undefined) {
        scene.remove(mesh);
    }
    if (line !== undefined) {
        scene.remove(line);
    }
}