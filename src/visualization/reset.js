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
