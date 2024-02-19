import * as typedef from "../typedefs";

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
    name() {
        return `<[${this.x}]|[${this.z}]|${this.xq}|${this.zq}|[${this.y}]>`;
    },
    nameXQ() {
        return `${this.name()}xq`;
    },
    nameZQ() {
        return `${this.name()}zq`;
    }
});

function qualiMin(stA, stB, axis) {
    const qA = stA[`${axis}q`];
    const qB = stB[`${axis}q`];

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
        console.log(sts);
        throw new Error("Range not overlapping.")
    }

    return iv;
}