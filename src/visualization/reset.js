export function resetScheme(scene, scheme) {
    resetGrid(scene);
    resetCS(scene);

    for (const st of scheme.statements) {
        const statement = scene.getObjectByName(st.name());
        const xQuali = scene.getObjectByName(st.nameXQ());
        const zQuali = scene.getObjectByName(st.nameZQ());

        scene.remove(statement);
        if (xQuali !== undefined) {
            scene.remove(xQuali);
        }
        if (zQuali !== undefined) {
            scene.remove(zQuali);
        }
    }
}

export function resetGrid(scene) {
    const grid = scene.getObjectByName("grid");
    if (grid !== undefined) {
        scene.remove(grid);
    }
}

function resetCS(scene) {
    const names = ["x", "y", "z"];
    for (const name of names) {
        const axis = scene.getObjectByName(`${name}-axis`);
        
        if (axis !== undefined) {
            scene.remove(axis);
        }
    }
}