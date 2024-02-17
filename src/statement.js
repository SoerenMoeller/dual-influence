import * as typedef from "./typedefs";

/**
 * Adds usefull methods to statements.
 * @param {typedef.Statement} st 
 * @returns {typedef.Statement}
 */
export const create = (st) => ({
    ...st, 
    width() {
        return st.x[1] - st.x[0];
    },
    height() {
        return st.y[1] - st.y[0];
    },
    depth() {
        return st.z[1] - st.z[0];
    },
    centerX() {
        return st.x[0] + this.width() / 2;
    },
    centerY() {
        return st.y[0] + this.height() / 2;
    },
    centerZ() {
        return st.z[0] + this.depth() / 2;
    }
});
