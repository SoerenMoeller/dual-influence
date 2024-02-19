import * as ST from "./statement.js"
import * as typedef from "../typedefs.js";

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
                x: getBounds(rawModel, 0),
                y: getBounds(rawModel, 4),
                z: getBounds(rawModel, 1)
            }
        }
    }

    const scheme = await fetch(path)
        .then(response => response.json())
        .then(data => processModel(data))
        .catch(error => console.error('Error fetching JSON:', error));

    return scheme;
}

/**
 * Returns the min and max bounds of all statements on the axis with the 
 * given index.
 * @param {Object} rawModel 
 * @param {string} key 
 * @returns {number[]}
 */
function getBounds(rawModel, index) {
    const sts = rawModel.statements;
    return [
        Math.min(...sts.map(x => x[index][0])), 
        Math.max(...sts.map(x => x[index][1]))
    ]
}

export function normalize(scene, scheme) {
    if (scheme.statements.length > 0 && Array.isArray(scheme.statements[0])) {
        return; // already normalized
    }

    const sts = scheme.statements;
    const xBounds = getSortedBounds(sts, "x");
    const yBounds = getSortedBounds(sts, "y");
    const xOverlapMap = buildOverlapMap(sts, "x");
    const yOverlapMap = buildOverlapMap(sts, "y");
    console.log(xOverlapMap);
}

function buildOverlapMap(sts, name) {
    const map = new Map();

    for (const st of sts) {
        const lower = st[name][0];
        const upper = st[name][1];

        if (map.has(lower)) {
            map.set(lower, addToArray(map.get(lower), st));
        } else {
            map.set(lower, [st]);
        }
        if (map.has(upper)) {
            map.set(upper, addToArray(map.get(upper), st));
        } else {
            map.set(upper, [st]);
        }
    }
}

function getSortedBounds(sts, name) {
    const bounds = sts.map(e => e[name][0]).concat(sts.map(e => e[name][1]));
    return [...new Set(bounds)].sort((a, b) => a - b);
}

function addToArray(arr, elem) {
    arr.push(elem);
    return arr;
}