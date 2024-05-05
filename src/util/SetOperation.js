export function intersectSet(setA, setB) {
    return new Set([...setA].filter(x => setB.has(x)));
}

export function unionSet(setA, setB) {
    if (setB === undefined) {
        debugger;
    }
    return new Set([...setA], [...setB]);
}