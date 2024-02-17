import * as ST from "./statement.js"
import * as typedef from "./typedefs.js";

/**
 * Reads scheme from json file (under path), adds bounds for the axes 
 * and maps statements to intern representation.
 * @param {string} path 
 * @returns {typedef.Scheme}
 */
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

/**
 * Returns the min and max bounds of all statements on the axis named key.
 * @param {typedef.Scheme} rawModel 
 * @param {string} key 
 * @returns {number[]}
 */
function getBounds(rawModel, key) {
    const sts = rawModel.statements;
    return [
        Math.min(...sts.map(x => x[key][0])), 
        Math.max(...sts.map(x => x[key][1]))
    ]
}