import * as typedef from "../util/TypeDefs.js";
import * as C from "../util/Constants.js";

/**
 * Create internal representation for statements.
 * @param {Object} st 
 * @returns {typedef.Statement}
 */
export const create = (st) => addFunctions({
    x: st[0],
    z: st[1],
    xq: st[2],
    zq: st[3],
    y: st[4]
});

export const addFunctions = (st) => ({
    ...st,
    width() {
        return this.x[1] - this.x[0];
    },
    height() {
        return this.y[1] - this.y[0];
    },
    depth() {
        return this.z[1] - this.z[0];
    },
    centerX() {
        return this.x[0] + this.width() / 2;
    },
    centerY() {
        return this.y[0] + this.height() / 2;
    },
    centerZ() {
        return this.z[0] + this.depth() / 2;
    },
    nonSingleton() {
        return this.z[0] != this.z[1] && this.x[0] != this.x[1];
    },
    singletonFTB() {
        return this.z[0] == this.z[1];
    },
    singletonLTR() {
        return this.x[0] == this.x[1];
    },
    trueSingletonFTB() {
        return this.singletonFTB() && !this.singletonLTR();
    },
    trueSingletonLTR() {
        return this.singletonLTR() && !this.singletonFTB();
    },
    singleton() {
        return this.singletonFTB() && this.singletonLTR();
    }
});


export function qualiMin(sts, axis) {
    sts = [...sts];
    return sts.reduce(
        (accumulator, currentValue) => qualiMin2(accumulator, currentValue[axis + "q"]),
        C.ARB
    );
}

function qualiMin2(qualiA, qualiB) {
    const map = new Map()
        .set(C.MONO,  new Map()
            .set(C.MONO, C.MONO)
            .set(C.ANTI, C.CONST)
            .set(C.ARB, C.MONO)
            .set(C.CONST, C.CONST))
        .set(C.ANTI,  new Map()
            .set(C.MONO, C.CONST)
            .set(C.ANTI, C.ANTI)
            .set(C.ARB, C.ANTI)
            .set(C.CONST, C.CONST))
        .set(C.ARB,  new Map()
            .set(C.MONO, C.MONO)
            .set(C.ANTI, C.ANTI)
            .set(C.ARB, C.ARB)
            .set(C.CONST, C.CONST))
        .set(C.CONST,  new Map()
            .set(C.MONO, C.CONST)
            .set(C.ANTI, C.CONST)
            .set(C.ARB, C.CONST)
            .set(C.CONST, C.CONST))
        
    return map.get(qualiA).get(qualiB);
}

function intersectIv(ivA, ivB) {
    if (ivA === undefined || ivB === undefined ) {
        return;
    }
    if (!(ivA[0] <= ivB[1] && ivA[1] >= ivB[0])) {
        return;
    }

    const iv = [Math.max(ivA[0], ivB[0]), Math.min(ivA[1], ivB[1])];
    if (iv[0] > iv[1]) {
        return;
    }

    return iv;
}

export function intersectY(sts) {
    sts = [...sts];
    if (sts.length == 0) {
        return [-Infinity, Infinity];
    }

    const iv = sts.reduce(
        (accumulator, currentValue) => intersectIv(accumulator, currentValue.y),
        sts[0].y);

    if (iv === undefined) {
        debugger;
        throw new Error("Range not overlapping.")
    }

    return iv;
}
