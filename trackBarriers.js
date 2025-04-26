function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
import * as THREE from 'three';
export var TrackBarriers = /*#__PURE__*/ function() {
    "use strict";
    function TrackBarriers(game) {
        _class_call_check(this, TrackBarriers);
        this.game = game;
        this.barrierElements = [];
    }
    _create_class(TrackBarriers, [
        {
            key: "createDirectionalArrows",
            value: function createDirectionalArrows(curve, trackWidth) {
                var group = new THREE.Group();
                // Sample points along the track curve with reduced sampling
                var points = curve.getPoints(100); // Fewer points for optimization
                var frames = curve.computeFrenetFrames(100, true);
                // Create direction arrows less frequently for better performance
                for(var i = 0; i < points.length; i += 15){
                    var point = points[i];
                    var normal = frames.normals[i];
                    var tangent = frames.tangents[i];
                    // Create directional arrows on both sides of the track
                    this.addDirectionArrow(point, normal, tangent, trackWidth / 2 + 0.5, group);
                    this.addDirectionArrow(point, normal, tangent, -(trackWidth / 2 + 0.5), group);
                }
                return group;
            }
        },
        {
            key: "addDirectionArrow",
            value: function addDirectionArrow(trackPoint, normal, tangent, offset, parent) {
                // Create a position at the track edge
                var position = new THREE.Vector3().copy(trackPoint).addScaledVector(normal, offset);
                // Create an arrow that points in the direction of the track
                var arrowGroup = new THREE.Group();
                arrowGroup.position.copy(position);
                arrowGroup.position.y = 0.1; // Just above the ground
                // Calculate rotation to face along track direction
                var angle = Math.atan2(tangent.x, tangent.z);
                arrowGroup.rotation.y = angle;
                // Create the arrow shape (simplified)
                var arrowMaterial = new THREE.MeshToonMaterial({
                    color: 0xFFFFFF,
                    emissive: 0x333333,
                    gradientMap: this.game.world.createToonGradient() // Use existing gradient from gameWorld
                });
                // Arrow body
                var bodyGeometry = new THREE.BoxGeometry(0.4, 0.1, 1.2);
                var body = new THREE.Mesh(bodyGeometry, arrowMaterial);
                body.position.z = -0.3;
                arrowGroup.add(body);
                // Arrow head (triangle)
                var headGeometry = new THREE.ConeGeometry(0.3, 0.6, 4);
                var head = new THREE.Mesh(headGeometry, arrowMaterial);
                head.position.z = -1.1;
                head.rotation.x = Math.PI / 2;
                arrowGroup.add(head);
                // Add to parent and track for cleanup
                parent.add(arrowGroup);
                this.barrierElements.push(arrowGroup);
                return arrowGroup;
            }
        }
    ]);
    return TrackBarriers;
}();
