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

function createDotStatement(xOverlapMap, overlappingZ, x, z) {
    const overlappingX = xOverlapMap.get(x);
    const sts = JS.intersectSet(overlappingX, overlappingZ);
    
    const ys = ST.intersectY(sts);
    return ST.addFunctions({
        x: [x, x],
        z: [z, z],
        y: ys,
        xq: C.CONST,
        zq: C.CONST
    });
}

function createUnitZStatement(xOverlapMap, overlappingZ, x, nextX, z) {
    const overlappingX = JS.unionSet(xOverlapMap.get(x), xOverlapMap.get(nextX));
    const sts = JS.intersectSet(overlappingX, overlappingZ);
    const ys = ST.intersectY(sts);
    const quali = ST.qualiMin(sts, C.X_AXIS);

    return ST.addFunctions({
        x: [x, nextX],
        z: [z, z],
        y: ys,
        xq: quali,
        zq: C.CONST
    });
}

function createUnitXStatement(xOverlapMap, zOverlapMap, x, z, nextZ) {
    const overlappingX = xOverlapMap.get(x);
    const overlappingZ = JS.unionSet(zOverlapMap.get(z), zOverlapMap.get(nextZ));
    const sts = JS.intersectSet(overlappingX, overlappingZ);
    const quali = ST.qualiMin(sts, "z");
    
    const ys = ST.intersectY(sts);
    return ST.addFunctions({
        x: [x, x],
        z: [z, nextZ],
        y: ys,
        xq: C.CONST,
        zq: quali
    });
}

function createStatement(xOverlapMap, zOverlapMap, x, nextX, z, nextZ) {
    const overlappingX = JS.unionSet(xOverlapMap.get(x), xOverlapMap.get(nextX));
    const overlappingZ = JS.unionSet(zOverlapMap.get(z), zOverlapMap.get(nextZ));
    const sts = JS.intersectSet(overlappingX, overlappingZ);
    if (sts.length == 0) {
        console.log("stop");
        debugger;
    }
    if (x == nextX || z == nextZ) {
        console.log("stop");
        debugger;
    }
    const ys = ST.intersectY(sts);
    const qualiX = ST.qualiMin(sts, C.X_AXIS);
    const qualiZ = ST.qualiMin(sts, C.Z_AXIS);

    return ST.addFunctions({
        x: [x, nextX],
        z: [z, nextZ],
        y: ys,
        xq: qualiX,
        zq: qualiZ
    });
}

function createUpperRow(xOverlapMap, overlappingZ, z, xBounds) {
    const row = [];
    for (let j = 0; j < xBounds.length - 1; j++) {
        const x = xBounds[j];
        const nextX = xBounds[j + 1];
        
        const dotStatement = createDotStatement(xOverlapMap, overlappingZ, x, z);
        const unitZStatement = createUnitZStatement(xOverlapMap, overlappingZ, x, nextX, z);
        row.push(dotStatement, unitZStatement);
    }

    const lastX = xBounds[xBounds.length - 1];
    const finalDotStatement = createDotStatement(xOverlapMap, overlappingZ, lastX, z);
    row.push(finalDotStatement);

    return row;
}

function createLowerRow(xOverlapMap, zOverlapMap, z, nextZ, xBounds) {
    const row = [];
    for (let j = 0; j < xBounds.length - 1; j++) {
        const x = xBounds[j];
        const nextX = xBounds[j + 1];
        
        const unitXStatement = createUnitXStatement(xOverlapMap, zOverlapMap, x, z, nextZ);
        const statement = createStatement(xOverlapMap, zOverlapMap, x, nextX, z, nextZ);
        row.push(unitXStatement, statement);
    }

    const lastX = xBounds[xBounds.length - 1];
    const finalUnitXStatement = createUnitXStatement(xOverlapMap, zOverlapMap, lastX, z, nextZ);
    row.push(finalUnitXStatement);

    return row;
}

/**
 * Seperates a scheme, meaning no statements overlap.
 * @param {typedef.Scheme} scheme Scheme to seperate. 
 * @returns 
 */
function seperate(scheme) {
    const sts = scheme.statements;
    const [xBounds, xOverlapMap] = buildOverlapMap(sts, C.X_AXIS);
    const [zBounds, zOverlapMap] = buildOverlapMap(sts, C.Z_AXIS);

    const newScheme = {...scheme};
    newScheme.statements = [];
    for (let i = 0; i < zBounds.length - 1; i++) {
        const z = zBounds[i];
        const nextZ = zBounds[i + 1];
        const overlappingZ = zOverlapMap.get(z);

        const upperRow = createUpperRow(xOverlapMap, overlappingZ, z, xBounds);
        const lowerRow = createLowerRow(xOverlapMap, zOverlapMap, z, nextZ, xBounds);

        newScheme.statements.push(upperRow, lowerRow);
    }
    const lastZ = zBounds[zBounds.length - 1];
    const overlappingZ = zOverlapMap.get(lastZ);
    const lastRow = createUpperRow(xOverlapMap, overlappingZ, lastZ, xBounds);
    newScheme.statements.push(lastRow);

    return newScheme;
}

/**
 * Normalizes a scheme and plots it.
 * @param {typedef.Scheme} scheme Scheme to normalize
 */
export function normalize(scheme) {
    if (scheme.statements.length > 0 && Array.isArray(scheme.statements[0])) {
        return; // already normalized
    }

    const newScheme = seperate(scheme);
    MAIN.loadScheme(newScheme);
}

/**
 * Expects a map where each bound points to the statements where it is a bound.
 * Adds these statements to all intermediate points (between start and end). 
 * @param {number[]} bounds 
 * @param {Map<number, Set<typedef.Statement>>} overlapMap 
 */
function extendOverlapMap(bounds, overlapMap) {
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

/**
 * Extracts all bounds of a scheme and which points are overlapped by 
 * which statements.
 * @param {typedef.Statement[]} sts Statetement to consider.
 * @param {String} name Name of the axis
 * @returns {Array} The sorted bounds and the map from points to sets of 
 * statements
 */
function buildOverlapMap(sts, name) {
    const map = new Map();
    const bounds = []

    for (const st of sts) {
        const lower = st[name][0];
        const upper = st[name][1];
        bounds.push(lower, upper);

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

    const sortedBounds = [...new Set(bounds)].sort((a, b) => a - b);
    extendOverlapMap(sortedBounds, map);

    // verify map (just for now because I am paranoid)
    for (const bound of sortedBounds) {
        for (const st of map.get(bound)) {
            if (!(bound <= st[name][1] && bound >= st[name][0])) {
                console.log("ERROR!");
            }
        }
    }
    for (const st of sts) {
        const relevantBounds = sortedBounds.filter((e) => e >= st[name][0] && e <= st[name][1]);
        for (const bound of relevantBounds) {
            if (!(map.get(bound).has(st))) {
                console.log("ERROR!");
            }
        }
    }

    return [sortedBounds, map];
}
