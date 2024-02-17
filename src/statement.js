export async function setupModel(path) {
    function processModel(rawModel) {
        return {
            x: rawModel.x,
            y: rawModel.y, 
            z: rawModel.z,
            statements: rawModel.statements.map(createStatement),
            bounds: {
                x: getBounds(rawModel, "x"),
                y: getBounds(rawModel, "y"),
                z: getBounds(rawModel, "z")
            }
        }
    }

    return fetch(path)
        .then(response => response.json())
        .then(data => processModel(data))
        .catch(error => console.error('Error fetching JSON:', error));
}

function getBounds(rawModel, key) {
    const sts = rawModel.statements;
    return [
        Math.min(...sts.map(x => x[key][0])), 
        Math.max(...sts.map(x => x[key][1]))
    ]
}

export const createStatement = (st) => ({
    ...st, 
    width() {
        return st.x[1] - st.x[0];
    },
    height() {
        return st.y[1] - st.y[0];
    },
    depth() {
        return st.z[1] - st.z[0];
    }
});
