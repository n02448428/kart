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
export var ItemManager = /*#__PURE__*/ function() {
    "use strict";
    function ItemManager(game) {
        _class_call_check(this, ItemManager);
        this.game = game;
        this.items = [];
        this._previewItemMesh = null; // Store the preview mesh
        this._previewKart = null; // Kart holding the preview
    }
    _create_class(ItemManager, [
        {
            key: "useItem",
            value: function useItem(kart, itemType) {
                switch(itemType){
                    case 'banana':
                        return this.dropBanana(kart);
                    case 'shell':
                        return this.fireShell(kart);
                    case 'boost':
                        return this.useBoost(kart);
                    default:
                        return false;
                }
            }
        },
        {
            key: "dropBanana",
            value: function dropBanana(kart) {
                var _this = this;
                // Create banana mesh
                var bananaGeometry = new THREE.SphereGeometry(0.5, 8, 8);
                var bananaMaterial = new THREE.MeshToonMaterial({
                    color: 0xFFFF00
                });
                var banana = new THREE.Mesh(bananaGeometry, bananaMaterial);
                // Position behind kart
                var behindDirection = new THREE.Vector3(0, 0, 1);
                behindDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.object.rotation.y);
                banana.position.copy(kart.object.position).addScaledVector(behindDirection, 2);
                banana.position.y = 0.25;
                // Add to scene
                this.game.scene.add(banana);
                // Add to items list
                this.items.push({
                    object: banana,
                    type: 'banana',
                    lifeTime: 10,
                    update: function(deltaTime) {
                        // Banana just sits there
                        _this.checkBananaCollisions(banana);
                    }
                });
                this.game.audioManager.playSound('itemDrop');
                return true;
            }
        },
        {
            key: "fireShell",
            value: function fireShell(kart) {
                var _this = this;
                // Create shell mesh
                var shellGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
                var shellMaterial = new THREE.MeshToonMaterial({
                    color: 0x00FF00
                });
                var shell = new THREE.Mesh(shellGeometry, shellMaterial);
                // Position in front of kart
                var forwardDirection = new THREE.Vector3(0, 0, -1);
                forwardDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.object.rotation.y);
                shell.position.copy(kart.object.position).addScaledVector(forwardDirection, 2);
                shell.position.y = 0.5;
                // Add to scene
                this.game.scene.add(shell);
                // Add to items list
                this.items.push({
                    object: shell,
                    type: 'shell',
                    direction: forwardDirection.clone(),
                    speed: 30,
                    lifeTime: 120,
                    update: function(deltaTime) {
                        // Move shell forward using the item's own speed property
                        shell.position.addScaledVector(forwardDirection, 30 * deltaTime);
                        // Keep the shell aligned with the ground at all times
                        shell.position.y = 0.5; // Fixed height above the ground
                        // Rotate only around y-axis to keep it aligned with the ground
                        shell.rotation.y += 0.2;
                        // Check for collisions
                        _this.checkShellCollisions(shell);
                        _this.checkShellWallCollisions(shell, forwardDirection);
                    }
                });
                this.game.audioManager.playSound('shellFire');
                return true;
            }
        },
        {
            key: "useBoost",
            value: function useBoost(kart) {
                // Apply speed boost
                kart.speed = kart.maxSpeed; // Use the max speed value
                kart.boosting = true;
                // Visual effect (simplified)
                var boostDuration = 2; // seconds
                // Create temporary boost effect
                var effectGeometry = new THREE.ConeGeometry(0.5, 1, 8);
                var effectMaterial = new THREE.MeshToonMaterial({
                    color: 0xFF4500,
                    transparent: true,
                    opacity: 0.7
                });
                var effect = new THREE.Mesh(effectGeometry, effectMaterial);
                // Position behind kart
                var behindDirection = new THREE.Vector3(0, 0, 1);
                behindDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.object.rotation.y);
                effect.position.copy(kart.object.position).addScaledVector(behindDirection, 1);
                effect.position.y = 0.5;
                effect.rotation.x = Math.PI / 2;
                kart.object.add(effect);
                // Remove effect and disable boosting state after boost duration
                setTimeout(function() {
                    kart.object.remove(effect);
                    kart.boosting = false;
                }, boostDuration * 1000);
                this.game.audioManager.playSound('boost');
                return true;
            }
        },
        {
            key: "checkBananaCollisions",
            value: function checkBananaCollisions(banana) {
                var _this = this;
                var karts = this.game.playerManager.karts;
                karts.forEach(function(kart) {
                    var distance = kart.object.position.distanceTo(banana.position);
                    if (distance < 1.5) {
                        // Kart slips on banana
                        kart.speed *= -0.5;
                        // Remove banana
                        _this.removeItem(banana);
                        _this.game.audioManager.playSound('slip');
                    }
                });
            }
        },
        {
            key: "checkShellCollisions",
            value: function checkShellCollisions(shell) {
                var _this = this;
                var karts = this.game.playerManager.karts;
                karts.forEach(function(kart) {
                    var distance = kart.object.position.distanceTo(shell.position);
                    if (distance < 1.5) {
                        // Kart hit by shell
                        kart.speed = 0;
                        // Remove shell
                        _this.removeItem(shell);
                        _this.game.audioManager.playSound('hit');
                    }
                });
            }
        },
        {
            key: "removeItem",
            value: function removeItem(itemObject) {
                // Remove from scene
                this.game.scene.remove(itemObject);
                // Remove from items list
                this.items = this.items.filter(function(item) {
                    return item.object !== itemObject;
                });
            }
        },
        {
            key: "update",
            value: function update() {
                var _this = this;
                var deltaTime = this.game.deltaTime;
                // Update all items
                this.items.forEach(function(item) {
                    item.lifeTime -= deltaTime;
                    // Remove items that have expired
                    if (item.lifeTime <= 0) {
                        _this.removeItem(item.object);
                        return;
                    }
                    // Update item behavior
                    if (item.update) {
                        item.update(deltaTime);
                    }
                });
            }
        },
        {
            key: "checkShellWallCollisions",
            value: function checkShellWallCollisions(shell, direction) {
                // Check if shell is outside track boundaries
                if (!this.game.world.isPointOnTrack(shell.position)) {
                    // Get closest point on track
                    var closestPoint = this.game.world.getClosestPointOnTrack(shell.position);
                    // Calculate normal vector (direction from shell to closest point)
                    var normal = new THREE.Vector3().subVectors(closestPoint, shell.position).normalize();
                    // Reflect direction vector across normal (bounce effect)
                    direction.reflect(normal);
                    // --- Removed position reset ---
                    // shell.position.copy(closestPoint); // REMOVED - Allows shell to bounce from impact point
                    // Keep a consistent height to stay on ground
                    shell.position.y = 0.5;
                    // Play bounce sound
                    this.game.audioManager.playSound('hit');
                }
            }
        },
        {
            // --- NEW Item Preview Methods ---
            key: "showItemPreview",
            value: function showItemPreview(kart, itemType) {
                // Remove existing preview if any
                this.hideItemPreview();
                if (!itemType) return; // No item, no preview
                var previewMesh = this._createPreviewMesh(itemType);
                if (!previewMesh) return; // Couldn't create preview for this type
                // Calculate position slightly behind and above the kart base
                var behindOffset = new THREE.Vector3(0, 0.8, 1.5); // y=0.8 for above driver, z=1.5 behind body
                behindOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0); // Apply axis angle relative to kart's LOCAL Z axis (which is 0 initially)
                previewMesh.position.copy(behindOffset);
                // Add preview to the kart's group so it moves with it
                kart.object.add(previewMesh);
                this._previewItemMesh = previewMesh;
                this._previewKart = kart; // Remember which kart has the preview
                console.log("ItemManager: Showing preview for ".concat(itemType));
            }
        },
        {
            key: "hideItemPreview",
            value: function hideItemPreview() {
                if (this._previewItemMesh && this._previewKart) {
                    console.log("ItemManager: Hiding item preview");
                    // Remove the mesh from the kart's group
                    this._previewKart.object.remove(this._previewItemMesh);
                    // Dispose of geometry/material if needed (optional for simple meshes)
                    if (this._previewItemMesh.geometry) this._previewItemMesh.geometry.dispose();
                    if (this._previewItemMesh.material) this._previewItemMesh.material.dispose();
                    this._previewItemMesh = null;
                    this._previewKart = null;
                }
            }
        },
        {
            key: "_createPreviewMesh",
            value: function _createPreviewMesh(itemType) {
                var geometry, material, mesh;
                var scale = 0.5; // Scale down preview items slightly
                switch(itemType){
                    case 'banana':
                        geometry = new THREE.SphereGeometry(0.5 * scale, 8, 6);
                        material = new THREE.MeshToonMaterial({
                            color: 0xFFFF00
                        });
                        mesh = new THREE.Mesh(geometry, material);
                        // Orient banana preview slightly
                        mesh.rotation.z = Math.PI / 4;
                        break;
                    case 'shell':
                        geometry = new THREE.BoxGeometry(0.6 * scale, 0.6 * scale, 0.6 * scale);
                        material = new THREE.MeshToonMaterial({
                            color: 0x00FF00
                        });
                        mesh = new THREE.Mesh(geometry, material);
                        break;
                    case 'boost':
                        geometry = new THREE.ConeGeometry(0.4 * scale, 0.8 * scale, 8);
                        material = new THREE.MeshToonMaterial({
                            color: 0xFF4500
                        }); // Orange
                        mesh = new THREE.Mesh(geometry, material);
                        mesh.rotation.x = Math.PI / 2; // Point it backwards relative to kart
                        break;
                    default:
                        console.warn("No preview mesh defined for item type: ".concat(itemType));
                        return null;
                }
                mesh.castShadow = true; // Optional: Preview can cast shadow
                return mesh;
            }
        }
    ]);
    return ItemManager;
}();
