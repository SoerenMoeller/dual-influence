import * as TypeDefs from "../util/TypeDefs";
import { drawCoordinateSystem } from "../view/CoordinateSystemView";

/**
 * Initializes a scheme. 
 * @param {TypeDefs.Scheme} scheme  
 */
function init(scheme) {
    SETTINGS.scheme = scheme
    drawCoordinateSystem(SETTINGS.scene, SETTINGS.scheme);
    // TODO: fix drawing statements and behaviors
    CUBOID.drawScheme(SETTINGS.scene, SETTINGS.scheme, SETTINGS.opacity);
    
    // prevents some visual clipping
    SETTINGS.scene.traverse( function( object ) {
        object.frustumCulled = false;
    } );

    changeCameraMode();
}

function stop() {

}

export { init };