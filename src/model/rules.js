import * as C from "../constants.js";

export function left(stA, stB) {
    if (stA.z != stB.z || stA.x[1] != stB.x[0] 
        || stA === undefined || stB === undefined) {
        return false;
    }
    return leftMono(stA, stB) || leftAnti(stA, stB);
}

function leftMono(stA, stB) {
    if (stA.xq != C.MONO || stA.y[1] <= stB.y[1]) {
        return false;
    }

    stA.y[1] = stB.y[1];
    return true;
}

function leftAnti(stA, stB) {
    if (stA.xq != C.ANTI || stA.y[0] >= stB.y[0]) {
        return false;
    }

    stA.y[0] = stB.y[0];
    return true;
}

export function right(stA, stB) {
    if (stA.z != stB.z || stA.x[1] != stB.x[0]
        || stA === undefined || stB === undefined) {
        return false;
    }
    return rightMono(stA, stB) || rightAnti(stA, stB);
}

function rightMono(stA, stB) {
    if (stB.xq != C.MONO || stB.y[0] >= stA.y[0]) {
        return false;
    }

    stB.y[0] = stA.y[0];
    return true;
}

function rightAnti(stA, stB) {
    if (stB.xq != C.ANTI || stB.y[1] <= stA.y[1]) {
        return false;
    }

    stB.y[1] = stA.y[1];
    return true;
}

export function front(stA, stB) {
    if (stA.x != stB.x || stA.z[1] != stB.z[0]
        || stA === undefined || stB === undefined) {
        return false;
    }
    return frontMono(stA, stB) || frontAnti(stA, stB);
}

function frontMono(stA, stB) {
    if (stA.zq != C.MONO || stA.y[1] <= stB.y[1]) {
        return false;
    }

    stA.y[1] = stB.y[1];
    return true;
}

function frontAnti(stA, stB) {
    if (stA.zq != C.ANTI || stA.y[0] >= stB.y[0]) {
        return false;
    }

    stA.y[0] = stB.y[0];
    return true;
}

export function back(stA, stB) {
    if (stA.x != stB.x || stA.z[1] != stB.z[0]
        || stA === undefined || stB === undefined) {
        return false;
    }
    return backMono(stA, stB) || backAnti(stA, stB);
}

function backMono(stA, stB) {
    if (stA.zq != C.MONO || stB.y[0] >= stA.y[0]) {
        return false;
    }

    stB.y[0] = stA.y[0];
    return true;
}

function backAnti(stA, stB) {
    if (stA.zq != C.ANTI || stB.y[1] <= stA.y[1]) {
        return false;
    }

    stB.y[1] = stA.y[1];
    return true;
}