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
// Character stats
var CHARACTERS = {
    lightweight: {
        name: 'Speedy',
        maxSpeed: 50,
        acceleration: 8,
        weight: 1,
        handling: 0.07,
        color: 0xFF5733
    },
    heavyweight: {
        name: 'Heavy',
        maxSpeed: 40,
        acceleration: 6,
        weight: 2,
        handling: 0.045,
        color: 0x3498DB
    }
};
export var PlayerManager = /*#__PURE__*/ function() {
    "use strict";
    function PlayerManager(game) {
        _class_call_check(this, PlayerManager);
        this.game = game;
        this.karts = [];
        this.playerKart = null;
        this.aiKarts = [];
        this.selectedCharacter = CHARACTERS.lightweight;
    }
    _create_class(PlayerManager, [
        {
            key: "initialize",
            value: function initialize() {
                // Get starting positions from the track
                var startingPositions = this.game.world.startingPositions || [];
                // If no starting positions defined, use default
                if (startingPositions.length === 0) {
                    console.warn('No starting positions found, using default position');
                    // Create player kart at default position
                    this.playerKart = this.createKart(this.selectedCharacter, new THREE.Vector3(0, 0.5, 0), true);
                    // Create AI karts at default positions - spaced further apart for larger track
                    var defaultStartPositions = [
                        new THREE.Vector3(4, 0.5, 0),
                        new THREE.Vector3(-4, 0.5, 0),
                        new THREE.Vector3(8, 0.5, 0),
                        new THREE.Vector3(-8, 0.5, 0)
                    ];
                    for(var i = 0; i < 4; i++){
                        var character = i % 2 === 0 ? CHARACTERS.lightweight : CHARACTERS.heavyweight;
                        this.aiKarts.push(this.createKart(character, defaultStartPositions[i], false));
                    }
                } else {
                    // Use track's starting positions
                    // First position for player
                    var playerStartPos = startingPositions[0];
                    this.playerKart = this.createKart(this.selectedCharacter, playerStartPos.position, true);
                    // Give player initial boost item
                    this.playerKart.currentItem = 'boost';
                    this.game.uiManager.updateItem('boost'); // Update UI immediately
                    // Set initial rotation to face the right direction
                    // Add PI to the rotation to face the opposite direction
                    this.playerKart.object.rotation.y = playerStartPos.rotation + Math.PI;
                    // Remaining positions for AI karts (up to 4 AI karts)
                    var aiCount = Math.min(4, startingPositions.length - 1);
                    for(var i1 = 0; i1 < aiCount; i1++){
                        var startPos = startingPositions[i1 + 1]; // +1 to skip player position
                        var character1 = i1 % 2 === 0 ? CHARACTERS.lightweight : CHARACTERS.heavyweight;
                        var aiKart = this.createKart(character1, startPos.position, false);
                        // Set initial rotation to face the right direction
                        aiKart.object.rotation.y = startPos.rotation;
                        this.aiKarts.push(aiKart);
                    }
                }
                // Ensure UI is updated even if default start positions are used
                if (!startingPositions || startingPositions.length === 0) {
                    this.playerKart.currentItem = 'boost';
                    this.game.uiManager.updateItem('boost');
                }
                // Set up camera to follow player
                this.setupFollowCamera();
            }
        },
        {
            key: "createKart",
            value: function createKart(character, position, isPlayer) {
                // Create kart body
                var kart = new THREE.Group();
                // We don't set a default rotation here anymore
                // The rotation will be set based on the starting position rotation values
                // Main body
                // Main body with cel-shaded style
                var bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
                var bodyMaterial = new THREE.MeshToonMaterial({
                    color: character.color,
                    // Add outline effect for cel-shaded look
                    emissive: 0x000000,
                    emissiveIntensity: 0.1
                });
                var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                body.castShadow = true;
                kart.add(body);
                // Add outline to kart for cel-shaded look
                var outlineGeometry = new THREE.BoxGeometry(1.05, 0.55, 1.55);
                var outlineMaterial = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    side: THREE.BackSide
                });
                var outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
                body.add(outline);
                // Wheels
                var wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8); // Reduced segments for cartoonier look
                var wheelMaterial = new THREE.MeshToonMaterial({
                    color: 0x333333,
                    // Add darker outline
                    emissive: 0x000000,
                    emissiveIntensity: 0.2
                });
                var wheelPositions = [
                    [
                        0.5,
                        -0.2,
                        0.5
                    ],
                    [
                        -0.5,
                        -0.2,
                        0.5
                    ],
                    [
                        0.5,
                        -0.2,
                        -0.5
                    ],
                    [
                        -0.5,
                        -0.2,
                        -0.5
                    ]
                ];
                wheelPositions.forEach(function(pos) {
                    var wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(pos[0], pos[1], pos[2]);
                    wheel.castShadow = true;
                    kart.add(wheel);
                });
                // Driver
                var driverGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                var driverMaterial = new THREE.MeshToonMaterial({
                    color: 0xFFD700,
                    // Add outline effect for cel-shaded look
                    emissive: 0x000000,
                    emissiveIntensity: 0.1
                });
                var driver = new THREE.Mesh(driverGeometry, driverMaterial);
                driver.position.set(0, 0.4, 0);
                driver.castShadow = true;
                kart.add(driver);
                // Add a small visual indicator under the kart to show position on track
                var shadowIndicator = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), new THREE.MeshBasicMaterial({
                    color: character.color,
                    transparent: true,
                    opacity: 0.3
                }));
                shadowIndicator.rotation.x = -Math.PI / 2;
                shadowIndicator.position.y = -0.45;
                kart.add(shadowIndicator);
                kart.position.copy(position);
                this.game.scene.add(kart);
                // Add kart properties
                var kartData = {
                    object: kart,
                    isPlayer: isPlayer,
                    speed: 0,
                    acceleration: character.acceleration,
                    maxSpeed: character.maxSpeed,
                    handling: character.handling,
                    weight: character.weight,
                    rotationSpeed: 0,
                    drifting: false,
                    driftTime: 0,
                    driftDirection: 0,
                    jumping: false,
                    jumpHeight: 0,
                    jumpTime: 0,
                    jumpDuration: 0.3,
                    maxJumpHeight: 0.8,
                    canJump: true,
                    currentItem: null,
                    waypoint: 0,
                    checkpoint: 0,
                    lap: 1,
                    boosting: false,
                    isHit: false,
                    hitTime: 0,
                    hitDuration: 1.2,
                    hitSpinSpeed: 25,
                    hitBounceHeight: 2.5,
                    position: isPlayer ? 1 : this.karts.length + 2,
                    game: this.game,
                    useItem: function useItem() {
                        if (this.currentItem) {
                            return this.game.itemManager.useItem(this, this.currentItem);
                        }
                        return false;
                    }
                };
                this.karts.push(kartData);
                return kartData;
            }
        },
        {
            key: "setupFollowCamera",
            value: function setupFollowCamera() {
                var camera = this.game.camera;
                camera.position.set(0, 5, 10); // Restored to original values
                camera.lookAt(this.playerKart.object.position);
            }
        },
        {
            key: "updatePlayerKart",
            value: function updatePlayerKart() {
                var input = this.game.inputManager;
                var kart = this.playerKart;
                var deltaTime = this.game.deltaTime;
                // Acceleration/braking with faster acceleration
                if (input.isAccelerating()) {
                    kart.speed += kart.acceleration * deltaTime;
                    // Implement quick acceleration to 300 in about 5 seconds (unless boosting)
                    var normalSpeedCap = 30;
                    var accelerationBoost = (normalSpeedCap - kart.speed) * 0.05 * deltaTime;
                    if (accelerationBoost > 0) {
                        kart.speed += accelerationBoost;
                    }
                    // Cap at 1200 for normal driving, but allow maxSpeed when boosting
                    if (!kart.boosting && kart.speed > normalSpeedCap) {
                        kart.speed = normalSpeedCap;
                    } else if (kart.speed > kart.maxSpeed) {
                        kart.speed = kart.maxSpeed;
                    }
                } else if (input.isReversing()) {
                    // Apply negative acceleration for reversing
                    kart.speed -= kart.acceleration * 1.5 * deltaTime; // Slightly slower acceleration in reverse
                    // Cap reverse speed
                    if (kart.speed < -kart.maxSpeed / 3) kart.speed = -kart.maxSpeed / 3;
                } else if (input.isBraking()) {
                    // Apply strong friction/deceleration only if moving forward
                    if (kart.speed > 0) {
                        kart.speed -= kart.acceleration * 2.5 * deltaTime; // Stronger deceleration for braking
                        if (kart.speed < 0) kart.speed = 0; // Don't go into reverse from braking
                    } else if (kart.speed < 0) {
                        // If moving backward and braking is pressed, decelerate towards zero
                        kart.speed += kart.acceleration * 2.5 * deltaTime;
                        if (kart.speed > 0) kart.speed = 0;
                    }
                } else {
                    // Default friction when no input (or only steering)
                    kart.speed *= 0.96; // Slightly less friction than before to allow coasting
                    if (Math.abs(kart.speed) < 0.1) kart.speed = 0;
                }
                // Jumping mechanic
                if (input.shouldHop() && !kart.jumping && !kart.drifting && kart.canJump) {
                    kart.jumping = true;
                    kart.jumpTime = 0;
                    kart.canJump = false; // Prevent another jump until space is released
                    this.game.audioManager.playSound('jump');
                }
                // Reset jump ability when space is released
                if (!input.shouldHop()) {
                    kart.canJump = true;
                }
                // Update jump if jumping
                if (kart.jumping) {
                    kart.jumpTime += deltaTime;
                    // Calculate jump height using a sin curve for smooth up and down
                    kart.jumpHeight = kart.maxJumpHeight * Math.sin(kart.jumpTime / kart.jumpDuration * Math.PI);
                    // Check if jump is complete
                    if (kart.jumpTime >= kart.jumpDuration) {
                        kart.jumping = false;
                        kart.jumpHeight = 0;
                        // Start drift if landing while holding left or right
                        if (input.getSteerAmount() < -0.1) {
                            kart.drifting = true;
                            kart.driftTime = 0;
                            kart.driftDirection = 1; // left
                            this.game.audioManager.playSound('drift');
                        } else if (input.getSteerAmount() > 0.1) {
                            kart.drifting = true;
                            kart.driftTime = 0;
                            kart.driftDirection = -1; // right
                            this.game.audioManager.playSound('drift');
                        }
                    }
                }
                // Steering with sensitivity
                // Get steering amount directly from input manager
                var turnAmount = -input.getSteerAmount() * kart.handling * 50; // Negated to match previous logic direction
                // Apply rotation based on turning input and speed
                // Use a slightly higher threshold to ensure stationary turning is active until kart gains some momentum
                var normalTurnSpeedThreshold = 0.5;
                if (Math.abs(kart.speed) > normalTurnSpeedThreshold) {
                    // Normal turning based on speed
                    kart.object.rotation.y += turnAmount * deltaTime * (kart.speed / kart.maxSpeed);
                } else if (turnAmount !== 0) {
                    // Allow minimal turning even when stopped or very slow
                    var stationaryTurnSpeed = 0.5; // Adjust this value for desired turn rate when stopped
                    kart.object.rotation.y += turnAmount * deltaTime * stationaryTurnSpeed;
                }
                // Calculate forward direction and movement
                var direction = new THREE.Vector3(0, 0, -1);
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.object.rotation.y);
                // Store current position before moving
                var currentPosition = kart.object.position.clone();
                // Calculate new position
                var newPosition = currentPosition.clone();
                newPosition.addScaledVector(direction, kart.speed * deltaTime);
                // Check for wall collision using the new system
                var collision = this.game.world.checkWallCollision(kart, newPosition);
                if (collision.collision) {
                    // Wall collision detected! PREVENT movement into the wall.
                    // Apply collision effects from the CURRENT position.
                    // Create visual/audio feedback at the theoretical impact point
                    this.createCollisionEffect(collision.impactPoint);
                    this.game.audioManager.playSound('hit');
                    // --- Simplified Collision Response ---
                    // Stop the kart completely
                    kart.speed = 0;
                    // Remove pushback and automatic turning - kart stays at currentPosition
                    // Screen shake can still happen if desired
                    if (collision.impactForce > 10) {
                        this.addScreenShake(collision.impactForce * 0.5); // Reduced intensity a bit
                    }
                // IMPORTANT: Do NOT update position to newPosition
                // Kart stays at currentPosition
                } else {
                    // No collision, proceed with normal movement
                    kart.object.position.copy(newPosition);
                    // Check for off-track (falling) only after successful movement
                    this.checkAndRecoverFromOffTrack(kart); // Re-enabled as a safety net
                }
                // Update height with jump height
                kart.object.position.y = 0.5 + kart.jumpHeight; // 0.5 is base height, add jump height
                // Drifting
                if (kart.drifting) {
                    kart.driftTime += deltaTime;
                    // Visual effect - tilt the kart while drifting
                    var tiltAngle = kart.driftDirection * 0.2;
                    kart.object.rotation.z = tiltAngle;
                    // Add particles or visual effects here
                    // End drift with boost if space is released
                    if (!input.shouldHop() || kart.speed < 5) {
                        // End drift
                        if (kart.driftTime > 1.0) {
                            // Apply boost based on drift time
                            var boostPower = Math.min(0.8, 0.5 + (kart.driftTime - 1.0) * 0.1);
                            kart.speed = kart.maxSpeed * boostPower;
                            kart.boosting = true;
                            // Set timeout to disable boosting state
                            setTimeout(function() {
                                kart.boosting = false;
                            }, 1500); // 1.5 seconds of boost
                            this.game.audioManager.playSound('boost');
                        }
                        kart.drifting = false;
                        kart.object.rotation.z = 0; // Reset tilt
                    }
                } else {
                    // Gradually reset tilt when not drifting
                    kart.object.rotation.z *= 0.9;
                }
                // Apply steering during drift or normal driving
                if (kart.drifting) {
                    // Stronger turning while drifting
                    kart.object.rotation.y += kart.driftDirection * kart.handling * 25 * deltaTime;
                }
                // Use item based on InputManager triggers
                if (input.shouldUseItem()) {
                    var itemTypeToUse = input.getItemTypeToUse(); // Get the item type saved during preview
                    if (itemTypeToUse) {
                        // Use the item directly via ItemManager, passing the retrieved type
                        this.game.itemManager.useItem(kart, itemTypeToUse);
                    // kart.currentItem and UI were already updated when preview started
                    }
                // Note: kart.useItem() is not called here as it relies on kart.currentItem
                }
            }
        },
        {
            key: "updateAIKarts",
            value: function updateAIKarts() {
                var _this = this;
                var waypoints = this.game.world.trackPoints;
                if (waypoints.length === 0) return;
                this.aiKarts.forEach(function(kart) {
                    // Get next waypoint
                    var targetWaypoint = waypoints[kart.waypoint];
                    // Calculate direction to waypoint
                    var direction = new THREE.Vector3().subVectors(targetWaypoint, kart.object.position);
                    var distance = direction.length();
                    // --- Start NaN/Zero Check ---
                    // If distance is near zero, kart is basically at the waypoint.
                    // Skip normalization/steering calculations this frame to avoid NaN issues.
                    if (distance < 0.01) {
                        // Advance waypoint if very close
                        kart.waypoint = (kart.waypoint + 1) % waypoints.length;
                        // Optionally slightly adjust position to prevent getting stuck exactly on the waypoint
                        kart.object.position.add(new THREE.Vector3(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.1 - 0.05));
                        return; // Skip rest of update for this kart this frame
                    }
                    // --- End NaN/Zero Check ---
                    // Reached waypoint?
                    if (distance < 3) {
                        kart.waypoint = (kart.waypoint + 1) % waypoints.length;
                    }
                    // Normalize direction *after* checking for zero length
                    direction.normalize();
                    // Calculate angle to target
                    var kartForward = new THREE.Vector3(0, 0, -1).applyQuaternion(kart.object.quaternion);
                    var angleToTarget = kartForward.angleTo(direction); // Use normalized direction
                    // Steer towards target
                    var crossProduct = new THREE.Vector3().crossVectors(kartForward, direction);
                    var steerDirection = Math.sign(crossProduct.y);
                    // --- NaN Check for Steering ---
                    if (isNaN(steerDirection)) {
                        console.warn("AI steerDirection became NaN. Kart:", kart.object.uuid, "Distance:", distance);
                        steerDirection = 0; // Default to no steering if calculation fails
                    }
                    // --- End NaN Check ---
                    // Update AI speed and steering
                    kart.speed += kart.acceleration * 0.8 * _this.game.deltaTime;
                    if (kart.speed > kart.maxSpeed * 0.7) kart.speed = kart.maxSpeed * 0.7;
                    var rotationChange = steerDirection * kart.handling * 40 * _this.game.deltaTime;
                    // --- NaN Check for Rotation ---
                    if (!isNaN(rotationChange)) {
                        kart.object.rotation.y += rotationChange;
                    } else {
                        console.warn("AI rotationChange became NaN. Kart:", kart.object.uuid);
                    }
                    // --- End NaN Check ---
                    // Move AI kart
                    var moveDirection = new THREE.Vector3(0, 0, -1);
                    moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.object.rotation.y);
                    // Store current position
                    var currentPosition = kart.object.position.clone();
                    // Calculate new position
                    var newPosition = currentPosition.clone();
                    newPosition.addScaledVector(moveDirection, kart.speed * _this.game.deltaTime);
                    // --- NaN Check for Position ---
                    if (isNaN(newPosition.x) || isNaN(newPosition.y) || isNaN(newPosition.z)) {
                        console.warn("AI newPosition became NaN. Skipping collision check and movement. Kart:", kart.object.uuid);
                        kart.speed = 0; // Stop the kart if its position is invalid
                        return; // Skip collision and movement update
                    }
                    // --- End NaN Check ---
                    // Check for wall collision
                    var collision = _this.game.world.checkWallCollision(kart, newPosition);
                    if (collision.collision) {
                        // AI hit a wall - PREVENT movement into the wall.
                        // --- Simplified Collision Response ---
                        // Stop the kart completely
                        kart.speed = 0;
                    // Remove pushback and automatic turning - kart stays at currentPosition
                    // Optionally, make AI try to steer away slightly on the *next* frame's logic,
                    // but don't force rotation here.
                    // IMPORTANT: Do NOT update position to newPosition
                    } else {
                        // No wall collision, proceed with normal movement
                        kart.object.position.copy(newPosition);
                        // Check for off-track (falling) only after successful movement
                        _this.checkAndRecoverFromOffTrack(kart); // Re-enabled as a safety net
                    }
                    // Use items randomly
                    if (kart.currentItem && Math.random() < 0.01) {
                        kart.useItem();
                        kart.currentItem = null;
                    }
                });
            }
        },
        {
            // Add collision effect for visual feedback
            key: "createCollisionEffect",
            value: function createCollisionEffect(position) {
                var _this = this;
                // Create a simple particle effect at collision point
                var particleCount = 5;
                var particles = new THREE.Group();
                for(var i = 0; i < particleCount; i++){
                    var size = 0.1 + Math.random() * 0.2;
                    var particle = new THREE.Mesh(new THREE.SphereGeometry(size, 4, 4), new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        transparent: true,
                        opacity: 0.8
                    }));
                    // Random position near impact
                    particle.position.copy(position);
                    particle.position.x += (Math.random() - 0.5) * 0.5;
                    particle.position.y += Math.random() * 0.5;
                    particle.position.z += (Math.random() - 0.5) * 0.5;
                    // Random velocity
                    particle.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 5, (Math.random() - 0.5) * 5);
                    // Add to group
                    particles.add(particle);
                }
                // Add to scene
                this.game.scene.add(particles);
                // Animate and remove after short time
                var startTime = Date.now();
                var duration = 500; // 500ms
                var animateParticles = function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed > duration) {
                        _this.game.scene.remove(particles);
                        return;
                    }
                    // Update particles
                    particles.children.forEach(function(particle) {
                        // Apply velocity
                        particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.016));
                        // Apply gravity
                        particle.userData.velocity.y -= 0.2;
                        // Fade out
                        particle.material.opacity = 0.8 * (1 - elapsed / duration);
                    });
                    requestAnimationFrame(animateParticles);
                };
                animateParticles();
            }
        },
        {
            key: "addScreenShake",
            value: function addScreenShake(intensity) {
                // Get the original camera position
                var camera = this.game.camera;
                var originalPosition = camera.position.clone();
                // Calculate shake amount based on collision intensity
                var shakeAmount = Math.min(intensity * 0.03, 0.15);
                // Add random offsets to camera position
                var shakeCamera = function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed > duration) {
                        // Reset camera position after shake
                        camera.position.lerp(originalPosition, 0.5);
                        return;
                    }
                    // Calculate diminishing shake effect over time
                    var remaining = 1 - elapsed / duration;
                    var xOffset = (Math.random() * 2 - 1) * shakeAmount * remaining;
                    var yOffset = (Math.random() * 2 - 1) * shakeAmount * remaining;
                    // Apply shake to camera position
                    camera.position.x += xOffset;
                    camera.position.y += yOffset;
                    // Continue shaking
                    requestAnimationFrame(shakeCamera);
                };
                // Start shake animation
                var startTime = Date.now();
                var duration = 300; // 300ms of shake
                shakeCamera();
            }
        },
        {
            // Check if kart is off track and recover if needed
            key: "checkAndRecoverFromOffTrack",
            value: function checkAndRecoverFromOffTrack(kart) {
                // --- Start Safety Check ---
                if (!this.game || !this.game.world) {
                    console.error("Game or World object not available in checkAndRecoverFromOffTrack");
                    return; // Cannot proceed without game world
                }
                // --- End Safety Check ---
                // Get track points from the world
                var trackCurve = this.game.world.trackCurve; // Use trackCurve directly
                if (!trackCurve) {
                    console.warn("Track curve not available for recovery check.");
                    return; // No track curve available
                }
                var trackPoints = trackCurve.getPoints(100);
                if (trackPoints.length === 0) return; // No track points available
                // Store current position
                var kartPos = kart.object.position;
                // Check if we're extremely far from the track
                // First find closest point on track
                var closestPoint = null;
                var minDistance = Infinity;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = trackPoints[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var point = _step.value;
                        var distance = new THREE.Vector2(kartPos.x, kartPos.z).distanceTo(new THREE.Vector2(point.x, point.z));
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestPoint = point;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                // If kart is off track (distance from centerline > half track width + buffer), recover
                // Make threshold much stricter: just slightly outside the track edge
                var recoveryThreshold = this.game.world.trackWidth / 2 + 1.0; // Half-width + 1 unit buffer
                if (minDistance > recoveryThreshold) {
                    // --- Start Null Check for closestPoint ---
                    if (!closestPoint) {
                        console.error("Recovery failed: closestPoint is null after searching trackPoints.");
                        return; // Cannot recover without a valid closest point
                    }
                    // --- End Null Check ---
                    // Create a recovery visual effect
                    this.createRecoveryEffect(kartPos);
                    // Move kart back to closest point on track
                    kart.object.position.x = closestPoint.x;
                    kart.object.position.z = closestPoint.z;
                    kart.object.position.y = 0.5; // Reset height
                    // Reset the kart's speed to zero
                    kart.speed = 0;
                    // Play recovery sound
                    this.game.audioManager.playSound('hit');
                    // Find track direction at this point to orient the kart
                    var pointIndex = trackPoints.indexOf(closestPoint); // Now safe due to the null check above
                    if (pointIndex !== -1) {
                        // Get next point on track to determine direction
                        var nextIndex = (pointIndex + 1) % trackPoints.length;
                        var nextPoint = trackPoints[nextIndex];
                        // Calculate direction to face
                        var direction = new THREE.Vector2(nextPoint.x - closestPoint.x, nextPoint.z - closestPoint.z).normalize();
                        // Set kart rotation to face along track (using X and Z components)
                        kart.object.rotation.y = Math.atan2(direction.x, direction.z);
                    }
                }
            }
        },
        {
            // Visual effect for recovery
            key: "createRecoveryEffect",
            value: function createRecoveryEffect(position) {
                var _this = this;
                // Create a flash effect to indicate recovery
                var flash = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 8), new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.7
                }));
                flash.position.copy(position);
                this.game.scene.add(flash);
                // Animate the flash and remove it
                var startTime = Date.now();
                var duration = 500; // 500ms
                var animateFlash = function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed > duration) {
                        _this.game.scene.remove(flash);
                        return;
                    }
                    // Scale up and fade out
                    var scale = 1 + elapsed / duration * 2;
                    flash.scale.set(scale, scale, scale);
                    flash.material.opacity = 0.7 * (1 - elapsed / duration);
                    requestAnimationFrame(animateFlash);
                };
                animateFlash();
            }
        },
        {
            key: "updateCamera",
            value: function updateCamera() {
                if (!this.playerKart) return;
                var kart = this.playerKart.object;
                var kameraOffset = new THREE.Vector3(0, 4, 8); // Restored to original values
                // Calculate camera position behind kart
                var direction = new THREE.Vector3(0, 0, 1);
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.rotation.y);
                var targetCameraPos = new THREE.Vector3().copy(kart.position).addScaledVector(direction, kameraOffset.z);
                targetCameraPos.y += kameraOffset.y;
                // Smooth camera movement
                this.game.camera.position.lerp(targetCameraPos, 0.1);
                this.game.camera.lookAt(kart.position);
            }
        },
        {
            key: "update",
            value: function update() {
                this.updatePlayerKart();
                this.updateAIKarts();
                this.updateCamera();
            }
        }
    ]);
    return PlayerManager;
}();
