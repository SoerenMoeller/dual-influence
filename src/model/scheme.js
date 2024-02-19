import * as ST from "./statement.js"
import * as typedef from "../typedefs.js";
import * as MAIN from "../../main.js";
import * as JS from "../js-helper.js";
import * as C from "../constants.js";

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
            statements: [...new Set(rawModel.statements.map(ST.create))],
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

export function normalize(scheme) {
    if (scheme.statements.length > 0 && Array.isArray(scheme.statements[0])) {
        return; // already normalized
    }

    let sts = scheme.statements;
    const xBounds = getSortedBounds(sts, "x");
    const zBounds = getSortedBounds(sts, "z");
    const xOverlapMap = buildOverlapMap(sts, "x");
    const zOverlapMap = buildOverlapMap(sts, "z");
    extendOverlapMap(xBounds, xOverlapMap, "x");
    extendOverlapMap(zBounds, zOverlapMap, "z");

    const newScheme = {...scheme};
    newScheme.statements = [];
    for (const i of JS.range(0, zBounds.length)) {
        const z = zBounds[i];
        const nextZ = zBounds[i + 1];
        const overlappingZ = zOverlapMap.get(z);
        const row = [];

        for (const j of JS.range(0, xBounds.length - 1)) {
            const x = xBounds[j];
            const nextX = xBounds[j + 1];
            
            // create dot statement
            const overlappingX = xOverlapMap.get(x);
            sts = JS.intersectSet(overlappingX, overlappingZ);
            
            console.log(x, z);
            const ys = ST.intersectY(sts);
            if (sts.length == 0) {
                //debugger;
            }
            let newSt = ST.addFunctions({
                x: [x, x],
                z: [z, z],
                y: ys,
                xq: C.CONST,
                zq: C.CONST
            });
            row.push(newSt);
        }
        newScheme.statements.push(row);
    }

    MAIN.loadScheme(newScheme);
    console.log(newScheme);
}

function extendOverlapMap(bounds, overlapMap, name) {
    const cache = new Set(); 
    for (const bound of bounds) {
        for (const st of overlapMap.get(bound)) {
            if (cache.has(st)) {
                cache.delete(st);
            } else {
                cache.add(st);
            }
        }

        for (const st of cache) {
            overlapMap.get(bound).add(st);
        }
    }
}

function buildOverlapMap(sts, name) {
    const map = new Map();

    for (const st of sts) {
        const lower = st[name][0];
        const upper = st[name][1];

        if (map.has(lower)) {
            map.set(lower, map.get(lower).add(st));
        } else {
            map.set(lower, new Set([st]));
        }
        if (map.has(upper)) {
            map.set(upper, map.get(upper).add(st));
        } else {
            map.set(upper, new Set([st]));
        }
    }

    return map;
}

function getSortedBounds(sts, name) {
    const bounds = sts.map(e => e[name][0]).concat(sts.map(e => e[name][1]));
    return [...new Set(bounds)].sort((a, b) => a - b);
}
