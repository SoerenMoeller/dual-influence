import * as THREE from "three";
import * as Constants from "../util/Constants.js";
import * as TypeDef from "../util/TypeDefs.js";


/**
 * Creates data about axes. Includes name, direction and the bounds of each axis.
 * @param {TypeDef.Scheme} scheme 
 * @returns {TypeDef.Axis[]}
 */
function createAxes(scheme) {
    const axes = [
        {dir: new THREE.Vector3(1, 0, 0), name: Constants.X_AXIS},
        {dir: new THREE.Vector3(0, 1, 0), name: Constants.Y_AXIS},
        {dir: new THREE.Vector3(0, 0, -1), name: Constants.Z_AXIS}
    ];

    // extract bounds
    for (const axis of axes) {
        // takes the lowest/largest value and adds some padding
        axis.minBound = Math.min(scheme.bounds[axis.name][0], 0) - 
            Math.max((scheme.bounds[axis.name][1] - scheme.bounds[axis.name][0]) * 0.3, 1);
        axis.maxBound = Math.max(scheme.bounds[axis.name][1], 0) + 
            Math.max((scheme.bounds[axis.name][1] - scheme.bounds[axis.name][0]) * 0.3, 1);
    }

    return axes;
}


/**
 * Draws the coordinate system. Draws each axis as an arrow.
 * @param {THREE.Scene} scene 
 * @param {TypeDef.Scheme} scheme 
 */
function drawCoordinateSystem(scene, scheme) {
    const axes = createAxes(scheme);

    for (const axis of axes) {
        // extract origin and length of arrow
        const origin = axis.dir.clone().multiplyScalar(axis.minBound);
        const length = axis.maxBound - axis.minBound;

        const arrow = new THREE.ArrowHelper(axis.dir, origin, length, Constants.GREEN, length * 0.05);
        arrow.line.material.linewidth = 2;
        scene.add(arrow);

        // draw the name of the axis
        const map = new THREE.TextureLoader().load( `../../${Constants.ASSETS_FOLDER}/${axis.name}.png` );
        const material = new THREE.SpriteMaterial( { map: map, side: THREE.DoubleSide } );
        const sprite = new THREE.Sprite( material );
        const pos = axis.dir.multiplyScalar(axis.maxBound + length / 20);
        sprite.position.set(pos.x, pos.y, pos.z);
        sprite.scale.set(length / 20, length / 20, length / 20);
        scene.add(sprite);
    }
}


export { drawCoordinateSystem };