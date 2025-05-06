function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
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
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
import * as THREE from 'three';
export var RaceManager = /*#__PURE__*/ function() {
    "use strict";
    function RaceManager(game) {
        _class_call_check(this, RaceManager);
        this.game = game;
        this.totalLaps = 3;
        this.raceStarted = false;
        this.raceFinished = false;
        this.checkpointRadius = 10; // Doubled for the larger track
        this.finalPositions = [];
    }
    _create_class(RaceManager, [
        {
            key: "initialize",
            value: function initialize() {
                var _this = this;
                // Start race countdown (simplified)
                setTimeout(function() {
                    return _this.startRace();
                }, 3000);
            }
        },
        {
            key: "startRace",
            value: function startRace() {
                this.raceStarted = true;
                this.game.audioManager.playSound('raceStart');
            }
        },
        {
            key: "getPlayerPosition",
            value: function getPlayerPosition() {
                // Calculate race positions based on checkpoints and laps
                var karts = _to_consumable_array(this.game.playerManager.karts);
                // Sort by lap and checkpoint progress
                karts.sort(function(a, b) {
                    if (a.lap > b.lap) return -1;
                    if (a.lap < b.lap) return 1;
                    if (a.checkpoint > b.checkpoint) return -1;
                    if (a.checkpoint < b.checkpoint) return 1;
                    return 0;
                });
                // Find player position
                var playerKart = this.game.playerManager.playerKart;
                return karts.findIndex(function(k) {
                    return k === playerKart;
                }) + 1;
            }
        },
        {
            key: "getPlayerLap",
            value: function getPlayerLap() {
                return this.game.playerManager.playerKart.lap;
            }
        },
        {
            key: "checkCollisions",
            value: function checkCollisions() {
                var _this = this;
                var karts = this.game.playerManager.karts;
                var checkpoints = this.game.world.checkpoints;
                var itemBoxes = this.game.world.itemBoxes;
                // Check each kart for collisions
                karts.forEach(function(kart) {
                    // Checkpoint collision
                    checkpoints.forEach(function(checkpoint, index) {
                        var distance = kart.object.position.distanceTo(checkpoint.position);
                        if (distance < _this.checkpointRadius) {
                            if (kart.checkpoint === index - 1 || kart.checkpoint === checkpoints.length - 1 && index === 0) {
                                kart.checkpoint = index;
                                // Check for lap completion
                                if (index === 0 && kart.checkpoint !== 0) {
                                    kart.lap++;
                                    if (kart.isPlayer) {
                                        _this.game.audioManager.playSound('lapComplete');
                                        // Check for race finish
                                        if (kart.lap > _this.totalLaps) {
                                            _this.finishRace(kart);
                                        }
                                    }
                                }
                            }
                        }
                    });
                    // Item box collision
                    itemBoxes.forEach(function(box) {
                        if (!box.userData.active) return;
                        var distance = kart.object.position.distanceTo(box.position);
                        if (distance < 2 && !kart.currentItem) {
                            // Give random item
                            _this.giveRandomItem(kart);
                            // Deactivate item box temporarily
                            box.userData.active = false;
                            box.visible = false;
                            // Reactivate after delay
                            setTimeout(function() {
                                box.userData.active = true;
                                box.visible = true;
                            }, 5000);
                        }
                    });
                    // Kart-kart collisions
                    karts.forEach(function(otherKart) {
                        if (kart === otherKart) return;
                        var distance = kart.object.position.distanceTo(otherKart.object.position);
                        if (distance < 2) {
                            // Simple bounce effect
                            var direction = new THREE.Vector3().subVectors(kart.object.position, otherKart.object.position).normalize();
                            // Heavier karts push more
                            var weightRatio = otherKart.weight / kart.weight;
                            kart.object.position.addScaledVector(direction, 0.1 * weightRatio);
                            kart.speed *= 0.8;
                        }
                    });
                });
            }
        },
        {
            key: "giveRandomItem",
            value: function giveRandomItem(kart) {
                var items = [
                    'banana',
                    'shell',
                    'boost'
                ];
                var randomItem = items[Math.floor(Math.random() * items.length)];
                kart.currentItem = randomItem;
                if (kart.isPlayer) {
                    this.game.uiManager.updateItem(randomItem);
                    this.game.audioManager.playSound('itemGet');
                }
            }
        },
        {
            key: "finishRace",
            value: function finishRace(kart) {
                if (kart.isPlayer && !this.raceFinished) {
                    this.raceFinished = true;
                    this.finalPositions.push(kart);
                    // Show finish message
                    alert("Race finished! You came in ".concat(this.getPlayerPosition()).concat(this.getPositionSuffix(this.getPlayerPosition()), " place!"));
                }
            }
        },
        {
            key: "getPositionSuffix",
            value: function getPositionSuffix(position) {
                if (position === 1) return 'st';
                if (position === 2) return 'nd';
                if (position === 3) return 'rd';
                return 'th';
            }
        },
        {
            key: "update",
            value: function update() {
                if (!this.raceStarted) return;
                if (this.raceFinished) return;
                this.checkCollisions();
            }
        }
    ]);
    return RaceManager;
}();
