export function changeOpacity(scene, scheme, opacity) {
    const sts = scheme.statements.flat();
    for (const st of sts) {
        if (st.width() != 0 || st.depth() != 0) {
            const statement = scene.getObjectByName(st.nameC());
            statement.material.opacity = opacity;
        }
    }
}

export function resetScheme(scene, scheme) {
    resetGrid(scene);
    resetCS(scene);

    for (const st of scheme.statements) {
        const statement = scene.getObjectByName(st.name());
        const statementCube = scene.getObjectByName(st.nameC());
        const xQuali = scene.getObjectByName(st.nameXQ());
        const zQuali = scene.getObjectByName(st.nameZQ());

        scene.remove(statement);
        scene.remove(statementCube);
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