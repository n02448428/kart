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
export var TrackBoundaryVisualizer = /*#__PURE__*/ function() {
    "use strict";
    function TrackBoundaryVisualizer(game) {
        _class_call_check(this, TrackBoundaryVisualizer);
        this.game = game;
        this.edgeLines = null;
    }
    _create_class(TrackBoundaryVisualizer, [
        {
            key: "createGlowingEdges",
            value: function createGlowingEdges(trackCurve, trackWidth) {
                // Remove any existing edges
                if (this.edgeLines) {
                    this.game.scene.remove(this.edgeLines);
                }
                // Create a container for all edge elements
                this.edgeLines = new THREE.Group();
                this.game.scene.add(this.edgeLines);
                // Create inner and outer edge lines
                this.createEdgeLine(trackCurve, trackWidth / 2, 0x00FFFF); // Inner edge - cyan
                this.createEdgeLine(trackCurve, -trackWidth / 2, 0xFF00FF); // Outer edge - magenta
                return this.edgeLines;
            }
        },
        {
            key: "createEdgeLine",
            value: function createEdgeLine(curve, offset, color) {
                // Sample points along the curve
                var numPoints = 200; // Higher resolution for smoother curves
                var points = curve.getPoints(numPoints);
                var frames = curve.computeFrenetFrames(numPoints, true);
                // Create geometry for the glowing line
                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                // Generate edge points with offset from track center
                for(var i = 0; i < points.length; i++){
                    var point = points[i];
                    var normal = frames.normals[i]; // Keep normal if needed for other calculations
                    var binormal = frames.binormals[i]; // Use binormal for horizontal offset
                    // Calculate offset position using binormal
                    var edgePos = new THREE.Vector3().copy(point).addScaledVector(binormal, offset);
                    // Set a fixed height slightly above the track - raised
                    edgePos.y = 0.06;
                    vertices.push(edgePos.x, edgePos.y, edgePos.z);
                }
                // Close the loop
                if (vertices.length > 0) {
                    vertices.push(vertices[0], vertices[1], vertices[2]);
                }
                // Set the vertices
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                // Create emissive material for glow effect
                var material = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 3,
                    transparent: true,
                    opacity: 1.0,
                    toneMapped: false
                });
                // Create the line
                var line = new THREE.Line(geometry, material);
                this.edgeLines.add(line);
                // Add a wider line with lower opacity for glow effect
                var glowMaterial = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 1,
                    transparent: true,
                    opacity: 0.3,
                    toneMapped: false
                });
                var glowLine = new THREE.Line(geometry, glowMaterial);
                // Offset slightly to prevent z-fighting - raised
                glowLine.position.y = 0.04;
                this.edgeLines.add(glowLine);
                return line;
            }
        },
        {
            key: "update",
            value: function update() {
                // Pulsing animation for the glowing track edges
                if (this.edgeLines) {
                    // Calculate a pulsing value between 0.6 and 1.0 using sin wave
                    var time = performance.now() * 0.001; // Convert to seconds
                    var pulseValue = 0.6 + Math.sin(time * 2.0) * 0.2;
                    // Apply the pulse to all edge lines
                    this.edgeLines.children.forEach(function(line, index) {
                        // Apply slightly different pulsing to main lines vs glow lines
                        if (index % 2 === 0) {
                            // Main line - adjust opacity
                            line.material.opacity = pulseValue;
                        } else {
                            // Glow line - adjust opacity and scale
                            line.material.opacity = pulseValue * 0.5;
                            // Make the glow slightly larger when brighter
                            var scaleValue = 1.0 + (pulseValue - 0.6) * 0.5;
                            line.scale.set(1, scaleValue, 1);
                        }
                    });
                }
            }
        }
    ]);
    return TrackBoundaryVisualizer;
}();
