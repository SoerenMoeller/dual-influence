import { Scene } from "three";
import * as C from "../constants.js";

export function build(scheme) {
    if (!scheme.normalized) {
        return;
    }

    const cornerFn = new Map();
    selectFirstTwoPoints(scheme, cornerFn);
    const sts = scheme.statements;
    for (let i = sts.lentgh - 2; i >= 0; i -= 2) {
        selectTopPoints(scheme, i, cornerFn);
    }
}

function selectTopPoints(scheme, index, cornerFn) {
    const sts = scheme.statements;
    const nextRow = sts[index - 1];
    const row = sts[index];
    const prevRow = sts[index + 1];

    const topSt = nextRow[1];
    const leftSt = row[0];
    const rightSt = row[2];
    const bottomSt = prevRow[1];

    const topLeftSt = nextRow[0];
    const topRightSt = nextRow[2];
    const bottomLeftSt = prevRow[0];
    const bottomRightSt = prevRow[2];

    // sanity check if statements have correct singleton intervals?

    const bottomLeftY = cornerFn.get(bottomLeftSt.x[0]).get(bottomLeftSt.z[0]);
    const bottomRightY = cornerFn.get(bottomRightSt.x[0]).get(bottomRightSt.z[0]);

    // TODO: Setup good cases first
}

function selectFirstTwoPoints(scheme, cornerFn) {
    const sts = scheme.statements;
    const fstSt = sts[sts.length - 1][0];
    const sndSt = sts[sts.length - 1][1];
    const trdSt = sts[sts.length - 1][2];

    if (!fstSt.singleton() || !sndSt.trueSingletonFTB() || !trdSt.singleton()) {
        debugger;
        throw new Error("Error in 'selectFirstTwoPoints', statements are not \
                         as expected.");
    }

    const fstY = fstSt.centerY();
    addEntry(cornerFn, fstSt.x[0], fstSt.z[0], fstY);
    if (sndSt.xq == C.MONO) {
        const sndY = (Math.max(fstY, trdSt.y[0]) + trdSt.y[1]) / 2;
        rangeCheck(trdSt, sndY);
        addEntry(cornerFn, trdSt.x[0], trdSt.z[0], sndY);
    } else if (sndSt.xq == C.ANTI) {
        const sndY = (trdSt.y[0] + Math.min(fstY, trdSt.y[1])) / 2;
        rangeCheck(trdSt, sndY);
        addEntry(cornerFn, trdSt.x[0], trdSt.z[0], sndY);
    } else if (sndSt.xq == C.CONST) {
        const sndY = fstY;
        rangeCheck(trdSt, sndY);
        addEntry(cornerFn, trdSt.x[0], trdSt.z[0], sndY);
    } else if (sndSt.xq == C.ARB) {
        throw new Error("Don't know yet..");
    } else {
        throw new Error(`Unknown quality: ${sndSt.xy}`);
    }
}

function rangeCheck(st, y) {
    if (st.y[0] <= y && st.y[1] >= y) {
        return;
    }

    throw new Error(`Error: ${y} is not in range of statement ${st}`);
}

function addEntry(cornerFn, x, z, y) {
    if (!cornerFn.has(x)) {
        cornerFn.set(x, new Map());
    }
    console.log(x, z, y);
    cornerFn.get(x).set(z, y);
}
