import * as TypeDefs from "../util/TypeDefs";
import Settings from "../util/Settings";
import { drawCoordinateSystem } from "../view/CoordinateSystemView";
import { drawStatement, drawStatementEdges } from "../view/StatementView";
import { splitScheme } from "../model/Scheme";
import { changeCameraMode } from "./SceneController";
import { drawBehaviors } from "../view/BehaviorView";


/**
 * Initializes a scheme. 
 * @param {TypeDefs.Scheme} scheme  
 */
function init(scheme) {
    Settings.scheme = scheme
    drawCoordinateSystem(Settings.scene, scheme);

    // The renderer rescales a box with width=height=depth=1. 
    // To deal with unit intervals, I make distinctions (e.g. to make the width 0)
    // firstly draw the outlines of the box
    const sts = splitScheme(scheme.statements.flat());
    const edgesSts = [
        [sts.nonUnit, 1, 1, 1], [sts.nonUnitH, 1, 0, 1],
        [sts.unitX, 0, 1, 1], [sts.unitXH, 0, 0, 1], 
        [sts.unitZ, 1, 1, 0], [sts.unitZH, 1, 0, 0],
        [sts.unit, 0, 1, 0], [sts.unitH, 0, 0, 0]
    ]

    for (const [sts, width, height, depth] of edgesSts) {
        drawStatementEdges(Settings.scene, sts, width, height, depth);
    }
    
    // draw the body of the sts now (the boxes)
    const bodySts = [
        [sts.nonUnit, 1, 1, 1],
        [sts.nonUnitH, 1, 0, 1],
        [sts.unitX, 0, 1, 1],
        [sts.unitZ, 1, 1, 0]
    ];

    for (const [sts, width, height, depth] of bodySts) {
        drawStatement(Settings.scene, sts, width, height, depth);
    }

    // draw the behaviors
    drawBehaviors(Settings.scene, Settings.scheme.statements.flat());
    
    // prevents some visual clipping
    Settings.scene.traverse(obj => obj.frustumCulled = false);

    // sets up camera for initial view
    let x = 0;
    let y = 3 * (Settings.scheme.bounds.y[1] - Settings.scheme.bounds.y[0]);
    let z = Settings.scheme.bounds.z[1] - Settings.scheme.bounds.z[0];
    Settings.camera.position.set(x, y, z);

    x = Settings.scheme.bounds.x[1]; - Settings.scheme.bounds.x[0];
    y = Settings.scheme.bounds.y[1]; - Settings.scheme.bounds.y[0];
    z = Settings.scheme.bounds.z[1]; - Settings.scheme.bounds.z[0];
    Settings.camera.lookAt(x, y, z);

    changeCameraMode();
}


/**
 * Removes the behaviors (svgs) from the scene
 */
function stopBehaviors() {
    let svg = Settings.scene.getObjectByName("behavior");
    while (svg !== undefined) {
        Settings.scene.remove(svg);
        svg = Settings.scene.getObjectByName("behavior");
    }
}


/**
 * Changes the opacity of every statement as specified.
 * @param {number} opacity 
 */
function changeOpacity(opacity) {
    const sts = Settings.scene.getObjectByName("sts");
    if (sts !== undefined) {
        sts.material.opacity = opacity;
    }
}


/**
 * Removes everything from the scene.
 */
function stop() {
    Settings.scene.clear();
}


export { init, stop, stopBehaviors, changeOpacity };
