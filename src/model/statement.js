import * as typedef from "../typedefs";

/**
 * Adds usefull methods to statements and changes access to them.
 * @param {Object} st 
 * @returns {typedef.Statement}
 */
export const create = (st) => ({
    x: st[0],
    z: st[1],
    xq: st[2],
    zq: st[3],
    y: st[4], 
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
        return `<${this.x}|${this.z}|${this.xq}|${this.zq}|${this.y}>`;
    }
});
