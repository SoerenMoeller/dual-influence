export function intersection(setA, setB) {
    return new Set([...setA].filter(x => setB.has(x)));
}

export function union(setA, setB) {
    return new Set([...setA], [...setB]);
}

/**
 * Creates range array.
 * @param {number} start 
 * @param {number} stop 
 * @param {number} step 
 * @returns {number[]}
 */
export function range(start, stop, step = 1) {
    return Array(Math.ceil((stop - start) / step))
        .fill(start)
        .map((x, y) => x + y * step);
}
