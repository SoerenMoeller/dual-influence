import * as ST from "./statement.js"

export async function setup(path) {
    function processModel(rawModel) {
        return {
            x: rawModel.x,
            y: rawModel.y, 
            z: rawModel.z,
            statements: rawModel.statements.map(ST.create),
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