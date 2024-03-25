import * as C from "../constants.js";
import * as TRIANGLE from "../visualization/triangles.js";

export function build(scheme, scene) {
    if (!scheme.normalized) {
        return;
    }

    const cornerFn = new Map();
    selectFirstPoint(scheme, cornerFn);
    fillFirstRow(scheme, cornerFn);
    fillOtherRows(scheme, cornerFn);
    console.log(cornerFn);
    /*
    selectFirstTwoPoints(scheme, cornerFn);
    const sts = scheme.statements;
    for (let i = sts.lentgh - 2; i >= 0; i -= 2) {
        selectTopPoints(scheme, i, cornerFn);
    }
    */
    TRIANGLE.draw(scene, scheme, cornerFn);
}

function selectFirstPoint(scheme, cornerFn) {
    const sts = scheme.statements;
    const firstSt = sts[sts.length-1][0]
    
    const range = firstSt.y;
    const value = (range[0] + range[1]) / 2
    addEntry(cornerFn, firstSt.x[0], firstSt.z[0], value);
}

function fillFirstRow(scheme, cornerFn) {
    const sts = scheme.statements;
    const firstRow = sts[sts.length-1];

    for (let i = 1; i < firstRow.length; i += 2 ) {
        const lastValue = cornerFn.get(firstRow[i-1].x[0]).get(firstRow[i-1].z[0]);
        const quality = firstRow[i].xq;
        const lower = firstRow[i+1].y[0];
        const upper = firstRow[i+1].y[1];

        const lbounds = [lower];
        const ubounds = [upper];
        restrictBounds(lbounds, ubounds, quality, lastValue);
        const value = (Math.max(...lbounds) + Math.min(...ubounds)) / 2;

        addEntry(cornerFn, firstRow[i+1].x[0], firstRow[i+1].z[0], value);
    }
}

function restrictBounds(lbounds, ubounds, quality, value) {
    if (quality == C.MONO) {
        lbounds.push(value);
    } else if (quality == C.ANTI) {
        ubounds.push(value);
    } else if (quality == C.CONST) {
        lbounds.push(value);
        ubounds.push(value);
    } 
}

function fillOtherRows(scheme, cornerFn) {
    const sts = scheme.statements;
    for (let i = sts.length - 1; i > 1; i -= 2) {
        let leftBehavior = sts[i-1][0].zq;
        let backBehavior = sts[i-2][1].xq;
        let rightBehavior = sts[i-1][2].zq;
        let lastValue = cornerFn.get(sts[i][0].x[0]).get(sts[i][0].z[0]);
        let lastValue2 = cornerFn.get(sts[i][2].x[0]).get(sts[i][2].z[0]);   
        let lower = sts[i-2][0].y[0];
        let upper = sts[i-2][0].y[1];
        let lbounds = [lower];
        let ubounds = [upper];
        let combinedBehavior = combineBehaviors(backBehavior, rightBehavior);
        restrictBounds(lbounds, ubounds, leftBehavior, lastValue);
        restrictBounds(lbounds, ubounds, combinedBehavior, lastValue2);

        let value = (Math.max(...lbounds) + Math.min(...ubounds)) / 2;
        if (isNaN(value)) {
            debugger;
        }
        if (!rangeCheck(sts[i-2][0], value)) {
            debugger;
        }
        addEntry(cornerFn, sts[i-2][0].x[0], sts[i-2][0].z[0], value);

        for (let j = 3; j < sts[i].length - 1; j += 2) {
            const leftBehavior = sts[i-1][j-1].zq;
            const backBehavior = sts[i-2][j].xq;
            const rightBehavior = sts[i-1][j+1].zq;
            const prevBehavior = sts[i-2][j-2].xq;
            const lastValue = cornerFn.get(sts[i][j-1].x[0]).get(sts[i][j-1].z[0]);
            const lastValue2 = cornerFn.get(sts[i][j+1].x[0]).get(sts[i][j+1].z[0]);
            const lastValue3 = cornerFn.get(sts[i-2][j-3].x[0]).get(sts[i-2][j-3].z[0]);
            const lower = sts[i-2][j-1].y[0];
            const upper = sts[i-2][j-1].y[1];
            const lbounds = [lower];
            const ubounds = [upper];
            const combinedBehavior = combineBehaviors(backBehavior, rightBehavior);
            restrictBounds(lbounds, ubounds, leftBehavior, lastValue);
            restrictBounds(lbounds, ubounds, combinedBehavior, lastValue2);
            restrictBounds(lbounds, ubounds, prevBehavior, lastValue3);

            const value = (Math.max(...lbounds) + Math.min(...ubounds)) / 2;
            if (value == 2.8575439453125) {
                debugger;
            }
            if (isNaN(value)) {
                debugger;
            }
            if (!rangeCheck(sts[i-2][j-1], value)) {
                const st = sts[i-2][j-1];
                debugger;
            }
            rangeCheck(sts[i-2][j-1], value);
            addEntry(cornerFn, sts[i-2][j-1].x[0], sts[i-2][j-1].z[0], value);
        }

        const prevBehavior = sts[i-2][sts[i-2].length - 2].xq;
        rightBehavior = sts[i-1][sts[i-1].length - 1].zq;
        lastValue = cornerFn.get(sts[i-2][sts[i-2].length - 3].x[0]).get(sts[i][sts[i-2].length - 3].z[0]);
        lastValue2 = cornerFn.get(sts[i][sts[i].length - 1].x[0]).get(sts[i][sts[i].length - 1].z[0]);   
        lower = sts[i-2][sts[i-2].length - 1].y[0];
        upper = sts[i-2][sts[i-2].length - 1].y[1];
        lbounds = [lower];
        ubounds = [upper];
        restrictBounds(lbounds, ubounds, prevBehavior, lastValue);
        restrictBounds(lbounds, ubounds, rightBehavior, lastValue2);

        value = (Math.max(...lbounds) + Math.min(...ubounds)) / 2;
        if (isNaN(value)) {
            debugger;
        }
        if (!rangeCheck(sts[i-2][sts[i-2].length - 1], value)) {
           debugger;
        }
        addEntry(cornerFn, sts[i-2][sts[i-2].length - 1].x[0], sts[i-2][sts[i-2].length - 1].z[0], value);
    }
}

function combineBehaviors(qb, qr) {
    if (qb == C.CONST && qr == C.CONST) {
        return C.CONST;
    }
    if (qb == C.MONO && qr == C.ANTI 
        || qb == C.MONO && qr == C.CONST 
        || qb == C.CONST && qr == C.ANTI) {
        return C.ANTI;
    }
    if (qb == C.ANTI && qr == C.MONO 
        || qb == C.ANTI && qr == C.CONST 
        || qb == C.CONST && qr == C.MONO) {
        return C.MONO;
    }
    return C.ARB;
}

function rangeCheck(st, y) {
    if (st.y[0] <= y && st.y[1] >= y) {
        return true;
    }
    return false;
    throw new Error(`Error: ${y} is not in range of statement ${st}`);
}

function addEntry(cornerFn, x, z, y) {
    if (!cornerFn.has(x)) {
        cornerFn.set(x, new Map());
    }
    cornerFn.get(x).set(z, y);
}
