import * as TypeDef from "../util/TypeDefs.js";
import * as Rules from "./Rules.js";
import * as Statement from "./Statement.js";
import * as Constants from "../util/Constants.js";
import * as SchemeController from "../controller/SchemeController.js";
import { intersectSet } from "../util/SetOperation.js";


/**
 * Reads scheme from json file, adds bounds for the axes 
 * and maps statements to intern representation.
 * @param {string} exampleName 
 * @returns {TypeDef.Scheme}
 */
export async function loadSchemeFromFile(exampleName) {
    const path = `../../${Constants.EXAMPLES_FOLDER}/${exampleName}.json`;
    function processModel(rawModel) {
        return {
            x: rawModel.x,
            y: rawModel.y, 
            z: rawModel.z,
            normalized: false,
            statements: [...new Set(rawModel.statements.map(Statement.create))],
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
 * 
 * @param {TypeDef.Statement[]} statements 
 * @returns 
 */
export function splitScheme(statements) {
    return {
        nonUnit: statements.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height() != 0}),
        nonUnitH: statements.filter((e) => {return e.width() != 0 && e.depth() != 0 && e.height() == 0}),
        unitX: statements.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height() != 0}),
        unitXH: statements.filter((e) => {return e.width() == 0 && e.depth() != 0 && e.height() == 0}),
        unitZ: statements.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height() != 0}),
        unitZH: statements.filter((e) => {return e.width() != 0 && e.depth() == 0 && e.height() == 0}),
        unit: statements.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height() != 0}),
        unitH: statements.filter((e) => {return e.width() == 0 && e.depth() == 0 && e.height() == 0})
    }    
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
    const sts = intersectSet(overlappingX, overlappingZ);
    
    const ys = Statement.intersectY(sts);
    return Statement.addFunctions({
        x: [x, x],
        z: [z, z],
        y: ys,
        xq: Constants.CONST,
        zq: Constants.CONST
    });
}


function createUnitZStatement(xOverlapMap, overlappingZ, x, nextX, z) {
    const overlappingX = intersectSet(xOverlapMap.get(x), xOverlapMap.get(nextX));
    const sts = intersectSet(overlappingX, overlappingZ);
    const ys = Statement.intersectY(sts);
    const quali = Statement.qualiMin(sts, Constants.X_AXIS);

    return Statement.addFunctions({
        x: [x, nextX],
        z: [z, z],
        y: ys,
        xq: quali,
        zq: Constants.CONST
    });
}


function createUnitXStatement(xOverlapMap, zOverlapMap, x, z, nextZ) {
    const overlappingX = xOverlapMap.get(x);
    const overlappingZ = intersectSet(zOverlapMap.get(z), zOverlapMap.get(nextZ));
    const sts = intersectSet(overlappingX, overlappingZ);
    const quali = Statement.qualiMin(sts, "z");
    
    const ys = Statement.intersectY(sts);
    return Statement.addFunctions({
        x: [x, x],
        z: [z, nextZ],
        y: ys,
        xq: Constants.CONST,
        zq: quali
    });
}


function createStatement(xOverlapMap, zOverlapMap, x, nextX, z, nextZ) {
    const overlappingX = intersectSet(xOverlapMap.get(x), xOverlapMap.get(nextX));
    const overlappingZ = intersectSet(zOverlapMap.get(z), zOverlapMap.get(nextZ));
    const sts = intersectSet(overlappingX, overlappingZ);
    const ys = Statement.intersectY(sts);
    const qualiX = Statement.qualiMin(sts, Constants.X_AXIS);
    const qualiZ = Statement.qualiMin(sts, Constants.Z_AXIS);

    return Statement.addFunctions({
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


function createIndexMap(scheme) {
    const indexMap = new Map();
    const sts = scheme.statements;
    for (let i = 0; i < sts.length; i++) {
        const row = sts[i];
        for (let j = 0; j < row.length; j++) {
            const st = row[j];
            indexMap.set(st, [i, j]);
        }
    }

    return indexMap;
}


/**
 * Seperates a scheme, meaning no statements overlap.
 * @param {TypeDef.Scheme} scheme Scheme to seperate. 
 * @returns 
 */
function seperate(scheme) {
    const sts = scheme.statements;
    const [xBounds, xOverlapMap] = buildOverlapMap(sts, Constants.X_AXIS);
    const [zBounds, zOverlapMap] = buildOverlapMap(sts, Constants.Z_AXIS);

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
    newScheme.statements = newScheme.statements.reverse() // as in paper, largest first

    return newScheme;
}


function prune(scheme) {
    const indexMap = createIndexMap(scheme);
    const sts = scheme.statements;
    let queue = sts.flat();
    const n = scheme.statements[0].length;
    const m = scheme.statements.length;

    while (queue.length != 0) {
        const st = queue[0];
        queue = queue.slice(1);

        const [i, j] = indexMap.get(st);
        if (j+1 < n) {
            const rightNeighbor = sts[i][j+1]
            const result = Rules.left(st, rightNeighbor);
            if (result) {
                if (j-1 >= 0) {
                    queue.push(sts[i][j-1]);
                }
                if (j+1 < n) {
                    queue.push(sts[i][j+1]);
                }
                if (i-1 >= 0) {
                    queue.push(sts[i-1][j]);
                }
                if (i+1 < m) {
                    queue.push(sts[i+1][j]);
                }
            }
        }
        if (j-1 >= 0) {
            const leftNeighbor = sts[i][j-1]
            const result = Rules.right(leftNeighbor, st);
            if (result) {
                if (j-1 >= 0) {
                    queue.push(sts[i][j-1]);
                }
                if (j+1 < n) {
                    queue.push(sts[i][j+1]);
                }
                if (i-1 >= 0) {
                    queue.push(sts[i-1][j]);
                }
                if (i+1 < m) {
                    queue.push(sts[i+1][j]);
                }
            }
        }
        if (i+1 < m) {
            const frontNeighbor = sts[i+1][j]
            const result = Rules.back(frontNeighbor, st);
            if (result) {
                if (j-1 >= 0) {
                    queue.push(sts[i][j-1]);
                }
                if (j+1 < n) {
                    queue.push(sts[i][j+1]);
                }
                if (i-1 >= 0) {
                    queue.push(sts[i-1][j]);
                }
                if (i+1 < m) {
                    queue.push(sts[i+1][j]);
                }
            }
        }
        if (i-1 >= 0) {
            const backNeighbor = sts[i-1][j]
            const result = Rules.front(st, backNeighbor);
            if (result) {
                if (j-1 >= 0) {
                    queue.push(sts[i][j-1]);
                }
                if (j+1 < n) {
                    queue.push(sts[i][j+1]);
                }
                if (i-1 >= 0) {
                    queue.push(sts[i-1][j]);
                }
                if (i+1 < m) {
                    queue.push(sts[i+1][j]);
                }
            }
        }
    }
}


/**
 * Normalizes a scheme and plots it.
 * @param {TypeDef.Scheme} scheme Scheme to normalize
 */
export function normalize(scheme) {
    if (scheme.normalized) {
        return; // already normalized
    }

    const newScheme = seperate(scheme);
    prune(newScheme);
    newScheme.normalized = true;
    
    SchemeController.stop();
    SchemeController.init(newScheme);
}


/**
 * Expects a map where each bound points to the statements where it is a bound.
 * Adds these statements to all intermediate points (between start and end). 
 * @param {number[]} bounds 
 * @param {Map<number, Set<TypeDef.Statement>>} overlapMap 
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

    return [sortedBounds, map];
}
