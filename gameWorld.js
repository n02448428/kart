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
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import * as THREE from 'three';
import { TrackBarriers } from './trackBarriers.js';
import { TrackBoundaryVisualizer } from './trackBoundaryVisualizer.js';
export var GameWorld = /*#__PURE__*/ function() {
    "use strict";
    function GameWorld(game) {
        _class_call_check(this, GameWorld);
        // Track properties for collision detection
        _define_property(this, "trackWidth", 12) // Width of the track
        ;
        _define_property(this, "trackCurve", null) // Store the track curve for collision detection
        ;
        _define_property(this, "innerBoundaryWidth", 3) // Width of inner boundary - doubled
        ;
        _define_property(this, "outerBoundaryWidth", 3) // Width of outer boundary - doubled
        ;
        this.game = game;
        this.scene = game.scene;
        this.trackPoints = [];
        this.checkpoints = [];
        this.itemBoxes = [];
        this.barriers = new TrackBarriers(game);
        this.boundaryVisualizer = new TrackBoundaryVisualizer(game);
        this.setupLighting();
        this.createTrack();
        this.createEnvironment();
    }
    _create_class(GameWorld, [
        {
            key: "createToonGradient",
            value: function createToonGradient() {
                var gradientMap = new THREE.DataTexture(new Uint8Array([
                    0,
                    80,
                    160,
                    255
                ]), 4, 1, THREE.LuminanceFormat, THREE.UnsignedByteType);
                gradientMap.minFilter = THREE.NearestFilter;
                gradientMap.magFilter = THREE.NearestFilter;
                gradientMap.generateMipmaps = false;
                gradientMap.needsUpdate = true;
                return gradientMap;
            }
        },
        {
            key: "setupLighting",
            value: function setupLighting() {
                // Brighter directional light
                var dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
                dirLight.position.set(5, 15, 7.5);
                dirLight.castShadow = true;
                dirLight.shadow.camera.near = 0.1;
                dirLight.shadow.camera.far = 50;
                dirLight.shadow.camera.right = 15;
                dirLight.shadow.camera.left = -15;
                dirLight.shadow.camera.top = 15;
                dirLight.shadow.camera.bottom = -15;
                dirLight.shadow.mapSize.width = 1024;
                dirLight.shadow.mapSize.height = 1024;
                this.scene.add(dirLight);
                // Ambient light (slightly brighter for cel-shaded look)
                var ambientLight = new THREE.AmbientLight(0xCCCCCC);
                this.scene.add(ambientLight);
                // Add hemisphere light for better color grading
                var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
                this.scene.add(hemisphereLight);
            }
        },
        {
            // Track properties for collision detection
            // These are now initialized in the constructor
            key: "createTrack",
            value: function createTrack() {
                // Create track group
                var trackGroup = new THREE.Group();
                this.scene.add(trackGroup);
                // Track dimensions
                this.trackWidth = 20; // Doubled track width for the larger scale
                var numPoints = 100;
                var trackPathPoints = [];
                this.trackPoints = [];
                // Create a more interesting track shape with multiple curves and straights - now twice as large
                for(var i = 0; i < numPoints; i++){
                    var t = i / numPoints;
                    var angle = t * Math.PI * 2;
                    // Simple oval track - doubled in size
                    var radiusX = 100; // doubled from 50
                    var radiusZ = 60; // doubled from 30
                    var x = radiusX * Math.cos(angle);
                    var z = radiusZ * Math.sin(angle);
                    var elevation = 0;
                    trackPathPoints.push(new THREE.Vector3(x, elevation, z));
                    this.trackPoints.push(new THREE.Vector3(x, elevation + 0.5, z));
                    // Add checkpoints every 20 points
                    if (i % 20 === 0 && i < numPoints - 1) {
                        var nextPoint = trackPathPoints[i + 1];
                        if (nextPoint) {
                            var angle1 = Math.atan2(nextPoint.z - z, nextPoint.x - x);
                            this.addCheckpoint(new THREE.Vector3(x, 0.5, z), angle1);
                        }
                    }
                    // Add item boxes every 15 points (not at start)
                    if (i % 15 === 0 && i !== 0) {
                        this.addItemBox(new THREE.Vector3(x, 1, z));
                    }
                }
                // Create a closed spline from the path points
                this.trackCurve = new THREE.CatmullRomCurve3(trackPathPoints);
                this.trackCurve.closed = true;
                // Create track surface with high contrast color (light gray)
                var trackSurface = this.createTrackSurface(this.trackCurve, this.trackWidth, 0xAAAAAA);
                trackGroup.add(trackSurface);
                // Create inner boundary (red and white striped curbs)
                var innerBoundary = this.createTrackBoundary(this.trackCurve, this.trackWidth / 2 + this.innerBoundaryWidth / 2, this.innerBoundaryWidth, 0xE74C3C);
                trackGroup.add(innerBoundary);
                // Create outer boundary (red and white striped curbs)
                var outerBoundary = this.createTrackBoundary(this.trackCurve, -(this.trackWidth / 2 + this.outerBoundaryWidth / 2), this.outerBoundaryWidth, 0xE74C3C);
                trackGroup.add(outerBoundary);
                // Add glowing edge lines for better track boundary visualization
                this.boundaryVisualizer.createGlowingEdges(this.trackCurve, this.trackWidth);
                // Add visible gravel areas outside the track
                var innerGravel = this.createGravelArea(this.trackCurve, this.trackWidth / 2 + this.innerBoundaryWidth * 2, 6, 0xD2B48C); // Sandy color
                var outerGravel = this.createGravelArea(this.trackCurve, -(this.trackWidth / 2 + this.outerBoundaryWidth * 2), 6, 0xD2B48C);
                trackGroup.add(innerGravel);
                trackGroup.add(outerGravel);
                // Track markers removed
                // Add boundary walls (uncommented)
                this.createTrackBoundaryWalls(this.trackCurve, trackGroup);
                // Create starting line (walls removed)
                this.createStartingLine(trackPathPoints[0], trackPathPoints[1], this.trackWidth);
                // Create a ground plane (larger for the bigger track)
                var groundGeometry = new THREE.PlaneGeometry(240, 160); // Doubled in size to match the larger track
                var groundMaterial = new THREE.MeshToonMaterial({
                    color: 0x1E5F21,
                    emissive: 0x111111,
                    gradientMap: this.createToonGradient()
                });
                var ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2;
                ground.position.y = -0.1;
                ground.receiveShadow = true;
                this.scene.add(ground);
            }
        },
        {
            key: "createTrackSurface",
            value: function createTrackSurface(curve, width, color) {
                // Create a ribbon-like geometry that follows the curve
                var frames = curve.computeFrenetFrames(100, true);
                var points = curve.getPoints(100);
                // Build geometry
                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                // No manual normals this time, let computeVertexNormals handle it
                for(var i = 0; i < points.length; i++){
                    var normal = frames.normals[i]; // Keep normal for potential future use (e.g., banking)
                    var binormal = frames.binormals[i]; // Use binormal for horizontal width
                    // Use binormal to calculate the horizontal offset for track width
                    var p1 = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, width / 2);
                    var p2 = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, -width / 2);
                    vertices.push(p1.x, 0.02, p1.z); // Raised track surface slightly
                    vertices.push(p2.x, 0.02, p2.z);
                }
                // Create indices for triangles
                var indices = [];
                for(var i1 = 0; i1 < points.length - 1; i1++){
                    var a = i1 * 2;
                    var b = a + 1;
                    var c = (i1 + 1) * 2;
                    var d = c + 1;
                    // Two triangles per segment
                    indices.push(a, b, c);
                    indices.push(c, b, d);
                }
                // Close the loop
                var a1 = (points.length - 1) * 2;
                var b1 = a1 + 1;
                var c1 = 0;
                var d1 = 1;
                indices.push(a1, b1, c1);
                indices.push(c1, b1, d1);
                // Set attributes
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setIndex(indices);
                // Calculate normals automatically
                geometry.computeVertexNormals();
                // Create track material - Restoring original ToonMaterial properties
                var material = new THREE.MeshToonMaterial({
                    color: color,
                    gradientMap: this.createToonGradient(),
                    shininess: 5,
                    // Re-adding DoubleSide to ensure visibility during debugging
                    side: THREE.DoubleSide,
                    emissive: 0x111111 // Restore slight emissive value
                });
                var surface = new THREE.Mesh(geometry, material);
                // No need for rotation or specific positioning, it follows the curve now
                // Add dashed center line (restored)
                var lineGeometry = new THREE.BufferGeometry();
                var lineCount = 50;
                var dashLength = 1.5;
                var gapLength = 3;
                var linePositions = [];
                var lineNormals = [];
                for(var i2 = 0; i2 < lineCount; i2++){
                    var t = i2 / lineCount;
                    var point = this.trackCurve.getPointAt(t);
                    var tangent = this.trackCurve.getTangentAt(t).normalize();
                    // Start and end points of dash
                    var start = new THREE.Vector3().copy(point).addScaledVector(tangent, -dashLength / 2);
                    var end = new THREE.Vector3().copy(point).addScaledVector(tangent, dashLength / 2);
                    linePositions.push(start.x, 0.03, start.z); // Raised center line
                    linePositions.push(end.x, 0.03, end.z);
                    // Normals point up
                    lineNormals.push(0, 1, 0);
                    lineNormals.push(0, 1, 0);
                }
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
                lineGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(lineNormals, 3));
                var lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xFFFFFF,
                    linewidth: 1
                });
                var centerLine = new THREE.LineSegments(lineGeometry, lineMaterial);
                surface.add(centerLine);
                surface.receiveShadow = true;
                return surface;
            }
        },
        {
            key: "createTrackBoundary",
            value: function createTrackBoundary(curve, offset, width, color) {
                // Create a ribbon-like boundary that follows the curve
                var frames = curve.computeFrenetFrames(100, true);
                var points = curve.getPoints(100);
                // Build geometry
                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                var normals = [];
                var uvs = []; // For texture mapping
                for(var i = 0; i < points.length; i++){
                    var normal = frames.normals[i]; // Keep normal for potential future use
                    var binormal = frames.binormals[i]; // Use binormal for horizontal offset
                    // Create points for the boundary at the specified offset from center using binormal
                    var center = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, offset);
                    var p1 = new THREE.Vector3().copy(center).addScaledVector(binormal, width / 2);
                    var p2 = new THREE.Vector3().copy(center).addScaledVector(binormal, -width / 2);
                    vertices.push(p1.x, 0.03, p1.z); // Raised boundaries (curbs)
                    vertices.push(p2.x, 0.03, p2.z);
                    // Add normals (pointing up)
                    normals.push(0, 1, 0);
                    normals.push(0, 1, 0);
                    // Add UVs for texture mapping
                    var t = i / points.length;
                    uvs.push(0, t);
                    uvs.push(1, t);
                }
                // Create indices for triangles
                var indices = [];
                for(var i1 = 0; i1 < points.length - 1; i1++){
                    var a = i1 * 2;
                    var b = a + 1;
                    var c = (i1 + 1) * 2;
                    var d = c + 1;
                    // Two triangles per segment
                    indices.push(a, b, c);
                    indices.push(c, b, d);
                }
                // Close the loop
                var a1 = (points.length - 1) * 2;
                var b1 = a1 + 1;
                var c1 = 0;
                var d1 = 1;
                indices.push(a1, b1, c1);
                indices.push(c1, b1, d1);
                // Set attributes
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                // Create striped pattern for the curbs
                var stripeCount = 20; // Number of stripes
                var stripeSize = 512 / stripeCount;
                // Create canvas for the pattern
                var canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                var ctx = canvas.getContext('2d');
                // Draw alternating stripes
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 512, 512);
                // Use proper color conversion from hex to CSS color string
                var colorStr = '#' + color.toString(16).padStart(6, '0');
                ctx.fillStyle = colorStr;
                for(var i2 = 0; i2 < stripeCount; i2 += 2){
                    ctx.fillRect(0, i2 * stripeSize, 512, stripeSize);
                }
                // Create texture from canvas
                var texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 15); // Repeat along track length
                // Create boundary material with cel-shaded style
                var material = new THREE.MeshToonMaterial({
                    map: texture,
                    gradientMap: this.createToonGradient()
                });
                var boundary = new THREE.Mesh(geometry, material);
                boundary.receiveShadow = true;
                return boundary;
            }
        },
        {
            key: "createStartingLine",
            value: function createStartingLine(p1, p2, trackWidth) {
                // Calculate direction vector between points
                var direction = new THREE.Vector3().subVectors(p2, p1).normalize();
                // Calculate perpendicular vector (normal to track direction)
                var normal = new THREE.Vector3(-direction.z, 0, direction.x);
                // Create starting line
                var startLineGeometry = new THREE.PlaneGeometry(trackWidth + 2, 3);
                var startLineMaterial = new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF,
                    roughness: 0.6,
                    side: THREE.DoubleSide
                });
                var startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
                // Position and rotate the starting line
                startLine.position.copy(p1);
                // Offset slightly to prevent z-fighting with the track - raised
                startLine.position.y = 0.04;
                // Calculate the angle to rotate the starting line
                // Calculate the angle to rotate the starting line
                // For karts to face in the direction of the track
                var angle = Math.atan2(direction.x, direction.z);
                startLine.rotation.y = angle;
                // Rotate to lie flat on the ground
                startLine.rotation.x = -Math.PI / 2;
                // startLine.position.y = 0.03; // This line is now redundant and handled above
                this.scene.add(startLine);
                // Add starting positions for karts
                this.startingPositions = [];
                var rows = 3; // 3 rows of karts
                var cols = 2; // 2 columns (left and right)
                for(var row = 0; row < rows; row++){
                    for(var col = 0; col < cols; col++){
                        // Calculate position: behind the starting line, staggered left and right
                        var positionOffset = new THREE.Vector3().copy(direction).multiplyScalar(4 + row * 3); // Space rows by 3 units, starting 4 units behind the line
                        var sideOffset = new THREE.Vector3().copy(normal).multiplyScalar(col === 0 ? -3 : 3); // Left or right by 3 units
                        var startPosition = new THREE.Vector3().copy(p1).sub(positionOffset).add(sideOffset);
                        startPosition.y = 0.5; // Kart height
                        this.startingPositions.push({
                            position: startPosition,
                            rotation: angle
                        });
                    }
                }
            }
        },
        {
            key: "createEnvironment",
            value: function createEnvironment() {
                // Add trees
                var treeGeometry = new THREE.ConeGeometry(1, 3, 6);
                var treeMaterial = new THREE.MeshToonMaterial({
                    color: 0x228B22
                });
                var trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
                var trunkMaterial = new THREE.MeshToonMaterial({
                    color: 0x8B4513
                });
                for(var i = 0; i < 30; i++){
                    var angle = Math.random() * Math.PI * 2;
                    var radius = 25 + Math.random() * 15;
                    var x = Math.cos(angle) * radius;
                    var z = Math.sin(angle) * radius;
                    var tree = new THREE.Group();
                    var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                    trunk.position.y = 0.5;
                    trunk.castShadow = true;
                    tree.add(trunk);
                    var top = new THREE.Mesh(treeGeometry, treeMaterial);
                    top.position.y = 2.5;
                    top.castShadow = true;
                    tree.add(top);
                    tree.position.set(x, 0, z);
                    this.scene.add(tree);
                }
            }
        },
        {
            key: "addCheckpoint",
            value: function addCheckpoint(position, rotation) {
                var checkpointGeometry = new THREE.BoxGeometry(6, 2, 0.2);
                var checkpointMaterial = new THREE.MeshToonMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.3
                });
                var checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
                checkpoint.position.copy(position);
                checkpoint.rotation.y = rotation;
                this.scene.add(checkpoint);
                this.checkpoints.push(checkpoint);
            }
        },
        {
            key: "addItemBox",
            value: function addItemBox(position) {
                var boxGeometry = new THREE.BoxGeometry(1, 1, 1);
                var boxMaterial = new THREE.MeshToonMaterial({
                    color: 0x00BFFF
                });
                var itemBox = new THREE.Mesh(boxGeometry, boxMaterial);
                itemBox.position.copy(position);
                itemBox.rotation.y = Math.PI / 4;
                // Add animation
                itemBox.userData = {
                    rotationSpeed: 0.01,
                    bounceHeight: 0.5,
                    bounceSpeed: 2,
                    originalY: position.y,
                    active: true
                };
                this.scene.add(itemBox);
                this.itemBoxes.push(itemBox);
            }
        },
        {
            key: "isPointOnTrack",
            value: function isPointOnTrack(position) {
                if (!this.trackCurve) return true; // If no track is defined, assume on track
                // Find closest point on track curve to the given position
                var closestPoint = this.getClosestPointOnTrack(position);
                // Calculate distance from point to track centerline
                var distance = position.distanceTo(closestPoint);
                // Point is on track if it's within half the track width (plus a small margin)
                // The margin helps prevent karts from getting stuck at the exact boundary
                return distance <= this.trackWidth / 2 + 0.5;
            }
        },
        {
            key: "checkWallCollision",
            value: function checkWallCollision(kart, newPosition) {
                if (!this.trackCurve) return {
                    collision: false
                };
                var kartDirection = null; // Define kartDirection in the function scope
                // Find closest point on track curve to the new position
                var closestPoint = this.getClosestPointOnTrack(newPosition);
                // Safety check: If getClosestPointOnTrack somehow failed, avoid calculating distance
                if (!closestPoint) {
                    console.warn("Could not find closest point on track for collision check.");
                    return {
                        collision: false
                    };
                }
                // Calculate distance from new position to track centerline
                var distance = newPosition.distanceTo(closestPoint);
                // Calculate if we're hitting a wall - add a small buffer inside the track edge
                var collisionThreshold = this.trackWidth / 2 - 0.1;
                var isColliding = distance > collisionThreshold;
                if (isColliding) {
                    // Create a vector from the center of the track to the kart's position
                    var normal = new THREE.Vector3().subVectors(newPosition, closestPoint).normalize();
                    // Calculate impact point - where exactly the wall is
                    var impactPoint = new THREE.Vector3().copy(closestPoint).addScaledVector(normal, this.trackWidth / 2);
                    // Calculate kartDirection only when needed, assign to the variable declared above
                    kartDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(kart.object.quaternion);
                    // Calculate impact force based on speed and angle of impact
                    var impactAngle = kartDirection.angleTo(normal);
                    // Estimate impact force based on *potential* speed if collision happened
                    var estimatedImpactSpeed = Math.abs(kart.speed);
                    var impactForce = Math.abs(Math.sin(impactAngle) * estimatedImpactSpeed);
                    return {
                        collision: true,
                        normal: normal,
                        // reflectionVector: reflectionVector, // Removed - Not used in simplified response
                        impactPoint: impactPoint,
                        impactForce: impactForce
                    };
                }
                return {
                    collision: false
                };
            }
        },
        {
            key: "getClosestPointOnTrack",
            value: function getClosestPointOnTrack(position) {
                // Safety check: Ensure trackCurve exists
                if (!this.trackCurve) {
                    console.warn("Track curve not available for getClosestPointOnTrack.");
                    return new THREE.Vector3(0, 0, 0); // Return a default Vector3
                }
                // Get a VERY dense sampling of points along the track for higher precision
                var numSamples = 500; // Increased from 200
                var trackPoints = this.trackCurve.getPoints(numSamples);
                // Safety check: Ensure trackPoints is not empty
                if (!trackPoints || trackPoints.length === 0) {
                    console.warn("No track points found for getClosestPointOnTrack.");
                    return new THREE.Vector3(0, 0, 0); // Return a default Vector3
                }
                // Find closest point
                var closestPoint = trackPoints[0]; // Default to the first point
                var minDistance = Infinity;
                for(var i = 0; i < trackPoints.length; i++){
                    var point = trackPoints[i];
                    // Safety check for valid position input
                    if (isNaN(position.x) || isNaN(position.z) || isNaN(point.x) || isNaN(point.z)) {
                        console.warn("NaN detected in position or track point during distance calculation.");
                        continue; // Skip this point if coordinates are invalid
                    }
                    // We only care about x and z coordinates (ignore height)
                    var distance = new THREE.Vector2(position.x, position.z).distanceTo(new THREE.Vector2(point.x, point.z));
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoint = point;
                    }
                }
                return closestPoint;
            }
        },
        {
            key: "update",
            value: function update() {
                // Animate item boxes
                this.itemBoxes.forEach(function(box) {
                    if (box.userData.active) {
                        box.rotation.y += box.userData.rotationSpeed;
                        box.position.y = box.userData.originalY + Math.sin(Date.now() * 0.002 * box.userData.bounceSpeed) * box.userData.bounceHeight;
                    }
                });
                // Update track boundary visualizer
                if (this.boundaryVisualizer) {
                    this.boundaryVisualizer.update();
                }
            }
        },
        {
            // createTrackMarkers removed as it was empty
            key: "createGravelArea",
            value: function createGravelArea(curve, offset, width, color) {
                // Create a ribbon-like gravel area that follows the curve
                var frames = curve.computeFrenetFrames(100, true);
                var points = curve.getPoints(100);
                // Build geometry
                var geometry = new THREE.BufferGeometry();
                var vertices = [];
                var normals = [];
                var uvs = [];
                for(var i = 0; i < points.length; i++){
                    var normal = frames.normals[i]; // Keep normal for potential future use
                    var binormal = frames.binormals[i]; // Use binormal for horizontal offset
                    // Create points for the gravel area at the specified offset from center using binormal
                    var center = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, offset);
                    var p1 = new THREE.Vector3().copy(center).addScaledVector(binormal, width / 2);
                    var p2 = new THREE.Vector3().copy(center).addScaledVector(binormal, -width / 2);
                    vertices.push(p1.x, 0.005, p1.z); // Slightly above ground to prevent z-fighting
                    vertices.push(p2.x, 0.005, p2.z);
                    // Add normals (pointing up)
                    normals.push(0, 1, 0);
                    normals.push(0, 1, 0);
                    // Add UVs for texture mapping
                    uvs.push(i % 2, i / points.length * 10);
                    uvs.push(i % 2 + 1, i / points.length * 10);
                }
                // Create indices for triangles
                var indices = [];
                for(var i1 = 0; i1 < points.length - 1; i1++){
                    var a = i1 * 2;
                    var b = a + 1;
                    var c = (i1 + 1) * 2;
                    var d = c + 1;
                    // Two triangles per segment
                    indices.push(a, b, c);
                    indices.push(c, b, d);
                }
                // Close the loop
                var a1 = (points.length - 1) * 2;
                var b1 = a1 + 1;
                var c1 = 0;
                var d1 = 1;
                indices.push(a1, b1, c1);
                indices.push(c1, b1, d1);
                // Set attributes
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                // Create a noisy texture for gravel
                var canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                var ctx = canvas.getContext('2d');
                // Draw base color - more efficient texture generation
                ctx.fillStyle = '#C2B280'; // Consistent sandy color
                ctx.fillRect(0, 0, 512, 512);
                // Add noise pattern for gravel texture - reduce particle count for better performance
                for(var i2 = 0; i2 < 5000; i2++){
                    var x = Math.random() * 512;
                    var y = Math.random() * 512;
                    var size = 1 + Math.random() * 2;
                    // Random darker and lighter stones - with better contrast
                    ctx.fillStyle = Math.random() > 0.5 ? '#96826E' : '#E6D7B9';
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Create texture from canvas
                var texture = new THREE.CanvasTexture(canvas);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(5, 20); // Repeat pattern
                // Create gravel material
                var material = new THREE.MeshToonMaterial({
                    map: texture,
                    gradientMap: this.createToonGradient()
                });
                var gravel = new THREE.Mesh(geometry, material);
                gravel.receiveShadow = true;
                return gravel;
            }
        },
        {
            key: "createTrackBoundaryWalls",
            value: function createTrackBoundaryWalls(curve, parent) {
                // Use the same sampling density as the track surface
                var frames = curve.computeFrenetFrames(100, true);
                var points = curve.getPoints(100);
                // Create materials for the boundary walls with cel-shaded style
                var wallMaterial = new THREE.MeshToonMaterial({
                    color: 0x888888,
                    gradientMap: this.createToonGradient()
                });
                // Create outer and inner boundary walls
                var wallHeight = 1.2;
                var trackHalfWidth = this.trackWidth / 2;
                // For debugging - log the track dimensions
                console.log("Track width: ".concat(this.trackWidth, ", half width: ").concat(trackHalfWidth));
                // Helper function to get Frenet frame data at a specific index
                // Moved inside this method to have access to `frames`
                var getFrameData = function(index) {
                    // Ensure index is within bounds
                    index = Math.max(0, Math.min(index, frames.binormals.length - 1));
                    return {
                        binormal: frames.binormals[index]
                    };
                };
                // Create wall segments - optimized placement interval
                var wallPlacementInterval = 4; // Create fewer walls for better performance
                for(var i = 0; i < points.length; i += wallPlacementInterval){
                    var normal = frames.normals[i]; // Keep normal for potential future use
                    var binormal = frames.binormals[i]; // Use binormal for horizontal offset
                    var point = points[i];
                    // Get the elevation at this point of the track
                    var trackElevation = point.y;
                    // IMPORTANT: Match the calculation from createTrackSurface which now uses binormal
                    // Line 156: const p1 = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, width/2);
                    // Line 157: const p2 = new THREE.Vector3().copy(points[i]).addScaledVector(binormal, -width/2);
                    // So p1 is one edge (binormal * width/2) and p2 is the other edge (binormal * -width/2)
                    // Let's define inner/outer based on the sign convention used elsewhere (e.g., boundaries)
                    // createTrackBoundary uses positive offset for inner, negative for outer.
                    var innerEdgePos = new THREE.Vector3().copy(point).addScaledVector(binormal, trackHalfWidth);
                    var outerEdgePos = new THREE.Vector3().copy(point).addScaledVector(binormal, -trackHalfWidth);
                    // Maintain track elevation
                    innerEdgePos.y = trackElevation;
                    outerEdgePos.y = trackElevation;
                    // Get frame data for the current index
                    var frameData = getFrameData(i);
                // Create wall segments - corrected placement:
                // innerEdgePos is on the inside of the track
                // outerEdgePos is on the outside of the track
                // this.createWallSegment(outerEdgePos, normal, wallHeight, wallMaterial, parent, true, frameData);  // outer wall (flag=true means outer) - REMOVED
                // this.createWallSegment(innerEdgePos, normal, wallHeight, wallMaterial, parent, false, frameData); // inner wall - REMOVED
                } // <<< Closing brace for the FOR LOOP
            } // <<< Closing brace for the createTrackBoundaryWalls method
        }
    ]);
    return GameWorld;
}();
