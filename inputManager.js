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
export var InputManager = /*#__PURE__*/ function() {
    "use strict";
    function InputManager(game) {
        _class_call_check(this, InputManager);
        this.game = game; // Store game instance
        this.accelerate = false; // Is the user holding down?
        this.brake = true; // Start braking by default
        this.steer = 0; // -1 for left, 1 for right, 0 for neutral
        // this.hop = false; // Replaced by trigger mechanism
        // this.useItem = false; // Replaced by trigger mechanism
        this.reverse = false; // NEW: Flag for reversing
        // Keyboard/UI Button State
        this.keys = {}; // Stores the pressed state of keys/buttons
        // Internal state for tracking pointer interaction
        this._isHolding = false;
        this._startPoint = {
            x: 0,
            y: 0
        };
        this._currentPoint = {
            x: 0,
            y: 0
        };
        this._isDragging = false;
        this._lastTapTime = 0; // Timestamp of the last tap ending
        this._downTime = 0; // Timestamp of pointerdown
        this._tapTimeout = 300; // ms threshold for double tap
        this._maxTapDuration = 200; // ms max duration for a tap vs hold
        this._doubleTapDown = false; // NEW: Flag to track if the current press is the second tap of a double-tap
        // State for single-frame triggers
        this._hopPressedLastFrame = false;
        this._itemPressedLastFrame = false;
        this._hopTriggeredThisFrame = false;
        this._itemTriggeredThisFrame = false;
        this._itemTypeToUseOnRelease = null; // NEW: Store the type of item being previewed
        // Sensitivity settings
        this._steerSensitivity = 80; // Pixels needed for max steer
        this._reverseThresholdY = 50; // Pixels down needed to trigger reverse
        this.setupListeners();
    }
    _create_class(InputManager, [
        {
            key: "setupListeners",
            value: function setupListeners() {
                var _this = this;
                var targetElement = document.body;
                // Pointer (Touch/Mouse) Listeners (Keep Existing)
                targetElement.addEventListener('pointerdown', function(e) {
                    // Ignore UI button clicks for general screen drag controls
                    if (e.target !== targetElement && e.target.tagName !== 'CANVAS') return;
                    e.preventDefault();
                    var downTime = Date.now();
                    var timeSinceLastTap = downTime - _this._lastTapTime;
                    // Check for double tap start
                    if (_this._lastTapTime !== 0 && timeSinceLastTap < _this._tapTimeout) {
                        // --- Double Tap Down ---
                        console.log("Pointer Down: Double Tap Start Detected! (Time Since Last: ".concat(timeSinceLastTap, "ms) - Item Ready"));
                        _this._doubleTapDown = true; // Mark this as the second tap down
                        _this._lastTapTime = 0; // Reset immediately to prevent triple tap issues
                        _this._hopTriggeredThisFrame = false; // Ensure no hop on double tap down
                        _this._itemTriggeredThisFrame = false; // Item is only *used* on release
                        // Get player kart and current item
                        var playerKart = _this.game.playerManager.playerKart;
                        var currentItemType = playerKart ? playerKart.currentItem : null;
                        if (playerKart && currentItemType) {
                            // Store the item type that will be used on release
                            _this._itemTypeToUseOnRelease = currentItemType;
                            // Show the preview for this item type
                            _this.game.itemManager.showItemPreview(playerKart, _this._itemTypeToUseOnRelease);
                            // Clear the player's current item slot immediately
                            playerKart.currentItem = null;
                            _this.game.uiManager.updateItem(null); // Update UI to show empty slot
                        }
                    } else {
                        // --- Single Tap Down / Hold Start ---
                        console.log("Pointer Down: Single Tap/Hold Start");
                        _this._doubleTapDown = false; // Not a double tap down
                        _this._hopTriggeredThisFrame = false; // Hop will trigger on UP for single tap now
                    // Don't reset _lastTapTime here, pointerup for single tap will set it
                    }
                    // Common logic for any pointer down
                    _this._isHolding = true;
                    _this.accelerate = true; // Always accelerate on down
                    _this.brake = false;
                    _this.reverse = false;
                    // Reset steer only if NOT starting a drag immediately (which is always true on down)
                    // this.steer = 0; // Let pointermove handle steer
                    _this._startPoint = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    _this._currentPoint = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    _this._isDragging = false;
                    _this._downTime = downTime; // Record time of this press
                }, {
                    passive: false
                });
                targetElement.addEventListener('pointerup', function(e) {
                    // Ignore UI button clicks for general screen drag controls
                    if (e.target !== targetElement && e.target.tagName !== 'CANVAS') return;
                    e.preventDefault();
                    if (_this._isHolding) {
                        var upTime = Date.now();
                        var duration = upTime - _this._downTime;
                        _this._isHolding = false; // Reset holding state first
                        console.log("Pointer Up: Duration=".concat(duration, "ms, IsDragging=").concat(_this._isDragging, ", LastTapTime Before Logic=").concat(_this._lastTapTime));
                        // --- Revised Release Logic ---
                        if (_this._doubleTapDown) {
                            // --- Release after Double Tap Start ---
                            // Use item regardless of duration or dragging, since preview was shown
                            console.log("  -> Release After Double Tap Detected (Duration: ".concat(duration, "ms, Dragging: ").concat(_this._isDragging, ") - Use Item Triggered"));
                            _this._itemTriggeredThisFrame = true; // USE item now
                            _this.game.itemManager.hideItemPreview(); // Hide preview
                            // Reset tap state completely
                            _this._lastTapTime = 0;
                            _this._doubleTapDown = false;
                            _this._isDragging = false; // Reset drag too
                        // Don't reset _itemTypeToUseOnRelease here yet, playerManager needs it
                        } else {
                            // --- Release after Single Tap Start (or hold/drag without double tap) ---
                            var isTapRelease = !_this._isDragging && duration < _this._maxTapDuration;
                            if (isTapRelease) {
                                // --- Single Tap Release ---
                                console.log("  -> Single Tap Release Detected (Duration: ".concat(duration, "ms) - Hop Triggered & Recording Tap Time"));
                                _this._hopTriggeredThisFrame = true;
                                _this._lastTapTime = upTime; // Record time for potential next tap
                            } else {
                                // --- Hold or Drag Release (Not part of a double tap) ---
                                console.log("  -> Hold/Drag Release (Not Double Tap)");
                                _this._isDragging = false; // Ensure drag state is reset
                                _this._lastTapTime = 0; // Reset tap timing sequence
                            // No need to hide preview here, as it wasn't shown for a single hold/drag
                            }
                        }
                        // Common release actions regardless of tap type
                        _this.accelerate = false;
                        _this.brake = true;
                        _this.reverse = false;
                        _this.steer = 0; // Reset steer on release
                    } // Close the 'if (this._isHolding)' block
                }, {
                    passive: false
                }); // Close the event listener callback and add options
                targetElement.addEventListener('pointermove', function(e) {
                    // Ignore UI button clicks for general screen drag controls
                    if (e.target !== targetElement && e.target.tagName !== 'CANVAS') return;
                    e.preventDefault();
                    if (_this._isHolding) {
                        _this._currentPoint = {
                            x: e.clientX,
                            y: e.clientY
                        };
                        var deltaX = _this._currentPoint.x - _this._startPoint.x;
                        var deltaY = _this._currentPoint.y - _this._startPoint.y;
                        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                            _this._isDragging = true;
                        }
                        // Determine action based on drag direction
                        if (deltaY > _this._reverseThresholdY && Math.abs(deltaX) < deltaY * 1.5) {
                            _this.reverse = true;
                            _this.accelerate = false; // Don't accelerate while reversing via pointer
                            _this.brake = false;
                            _this.steer = 0;
                        } else if (_this._isDragging) {
                            _this.reverse = false;
                            // Only accelerate via pointer if keyboard isn't braking/accelerating
                            if (!_this.keys['ArrowDown'] && !_this.keys['KeyS'] && !_this.keys['ArrowUp'] && !_this.keys['KeyW']) {
                                _this.accelerate = true;
                                _this.brake = false;
                            }
                            // Only steer via pointer if keyboard isn't steering
                            if (!_this.keys['ArrowLeft'] && !_this.keys['KeyA'] && !_this.keys['ArrowRight'] && !_this.keys['KeyD']) {
                                _this.steer = Math.max(-1, Math.min(1, deltaX / _this._steerSensitivity));
                            }
                        } else {
                            _this.reverse = false;
                            // Only brake via pointer if keyboard isn't accelerating/braking
                            if (!_this.keys['ArrowUp'] && !_this.keys['KeyW'] && !_this.keys['ArrowDown'] && !_this.keys['KeyS']) {
                                _this.accelerate = false;
                                _this.brake = true;
                            }
                            // Reset pointer steer if not dragging and keyboard isn't steering
                            if (!_this.keys['ArrowLeft'] && !_this.keys['KeyA'] && !_this.keys['ArrowRight'] && !_this.keys['KeyD']) {
                                _this.steer = 0;
                            }
                        }
                    }
                }, {
                    passive: false
                });
                targetElement.addEventListener('pointerleave', function() {
                    // Ignore UI button clicks for general screen drag controls
                    // if (e.target !== targetElement && e.target.tagName !== 'CANVAS') return; // Not needed for leave
                    if (_this._isHolding) {
                        console.log("Pointer Leave while Holding - Resetting State");
                        _this._isHolding = false;
                        _this.accelerate = false;
                        _this.brake = true;
                        _this.reverse = false;
                        _this.steer = 0;
                        _this._isDragging = false;
                        _this._lastTapTime = 0; // Reset tap sequence
                        _this._doubleTapDown = false; // Reset flag
                        _this._itemTypeToUseOnRelease = null; // Reset stored item type
                        _this.game.itemManager.hideItemPreview(); // Ensure preview is hidden
                    }
                });
                targetElement.addEventListener('pointercancel', function() {
                    // Ignore UI button clicks for general screen drag controls
                    // if (e.target !== targetElement && e.target.tagName !== 'CANVAS') return; // Not needed for cancel
                    if (_this._isHolding) {
                        console.log("Pointer Cancel while Holding - Resetting State");
                        _this._isHolding = false;
                        _this.accelerate = false;
                        _this.brake = true;
                        _this.reverse = false;
                        _this.steer = 0;
                        _this._isDragging = false;
                        _this._lastTapTime = 0; // Reset tap sequence
                        _this._doubleTapDown = false; // Reset flag
                        _this._itemTypeToUseOnRelease = null; // Reset stored item type
                        _this.game.itemManager.hideItemPreview(); // Ensure preview is hidden
                    }
                });
                // Keyboard Listeners
                window.addEventListener('keydown', function(e) {
                    // Use e.code for layout-independent keys
                    _this.keys[e.code] = true;
                    // Update direct state for WASD/Arrows based on keyboard
                    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                        _this.accelerate = true;
                        _this.brake = false;
                        _this.reverse = false;
                    }
                    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                        _this.brake = true;
                        _this.accelerate = false;
                        _this.reverse = false; // Basic brake/reverse toggle might need refinement
                    }
                    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                        _this.steer = -1;
                    }
                    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                        _this.steer = 1;
                    }
                });
                window.addEventListener('keyup', function(e) {
                    _this.keys[e.code] = false;
                    // Update direct state when keys are released
                    // Update direct state when keys are released
                    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                        _this.accelerate = false;
                        // If pointer isn't held (or isn't dragging), default to brake
                        if (!_this._isHolding || !_this._isDragging) {
                            _this.brake = true;
                        }
                    }
                    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                        _this.brake = false;
                        // If pointer isn't held (or isn't dragging), default to brake
                        if (!_this._isHolding || !_this._isDragging) {
                            _this.brake = true;
                        }
                    }
                    // Reset steer only if the currently active steer key is released
                    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                        // Check if the other keyboard steer key is still pressed
                        if (_this.keys['ArrowRight'] || _this.keys['KeyD']) {
                            _this.steer = 1; // Switch to right keyboard steer
                        } else if (_this._isHolding && _this._isDragging) {
                        // If pointer is actively steering, let it take over (recalculate on next move)
                        // For now, just don't force zero, pointermove will set it
                        } else {
                            _this.steer = 0; // No keys, no pointer drag = neutral steer
                        }
                    }
                    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                        // Check if the other keyboard steer key is still pressed
                        if (_this.keys['ArrowLeft'] || _this.keys['KeyA']) {
                            _this.steer = -1; // Switch to left keyboard steer
                        } else if (_this._isHolding && _this._isDragging) {
                        // If pointer is actively steering, let it take over
                        } else {
                            _this.steer = 0; // No keys, no pointer drag = neutral steer
                        }
                    } // End of ArrowRight/KeyD check
                }); // End of keyup listener
            } // End of setupListeners method
        },
        {
            // --- REMOVED isPressed Method ---
            // We now directly use the state properties (accelerate, brake, steer, reverse, hop, useItem)
            key: "update",
            value: function update() {
                // Check keyboard/UI state for hop and item use
                var hopKeyPressed = this.keys['Space'] || false;
                var itemKeyPressed = this.keys['KeyX'] || false; // Assuming 'X' key or corresponding UI button
                // Detect rising edge for hop (pressed this frame, not last frame)
                this._hopTriggeredThisFrame || (this._hopTriggeredThisFrame = hopKeyPressed && !this._hopPressedLastFrame);
                // Detect rising edge for item use ONLY from keyboard 'X' key press for now
                // The pointer double-tap logic sets _itemTriggeredThisFrame directly in pointerup
                var keyboardItemTrigger = itemKeyPressed && !this._itemPressedLastFrame;
                // If keyboard triggers item, OR pointer already triggered it this frame
                this._itemTriggeredThisFrame = this._itemTriggeredThisFrame || keyboardItemTrigger;
                // Update last frame's state for next frame's comparison
                this._hopPressedLastFrame = hopKeyPressed;
                this._itemPressedLastFrame = itemKeyPressed;
            // NOTE: The trigger flags (_hopTriggeredThisFrame, _itemTriggeredThisFrame)
            // are reset automatically when accessed by shouldHop/shouldUseItem if needed,
            // or can be reset here if preferred after all systems have checked them.
            // For now, we assume they are read once per frame.
            }
        },
        {
            // Accessor methods
            key: "isAccelerating",
            value: function isAccelerating() {
                // The state variables (accelerate, brake, reverse, steer) are now the source of truth
                // They are updated directly by event listeners
                return this.accelerate;
            }
        },
        {
            key: "isBraking",
            value: function isBraking() {
                // Brake if explicitly set, OR if not accelerating/reversing and pointer isn't active
                return this.brake || !this.accelerate && !this.reverse && !this._isHolding;
            }
        },
        {
            key: "isReversing",
            value: function isReversing() {
                return this.reverse;
            }
        },
        {
            key: "getSteerAmount",
            value: function getSteerAmount() {
                // The this.steer property is updated by both keyboard and pointer logic now
                return this.steer;
            }
        },
        {
            key: "shouldHop",
            value: function shouldHop() {
                var triggered = this._hopTriggeredThisFrame;
                // Reset trigger after reading so it only fires once per event
                this._hopTriggeredThisFrame = false;
                return triggered;
            }
        },
        {
            key: "shouldUseItem",
            value: function shouldUseItem() {
                var triggered = this._itemTriggeredThisFrame;
                if (triggered) {
                    console.log("InputManager: shouldUseItem() returning true, resetting flag.");
                    // Reset trigger AFTER reading so it only fires once per complete event cycle
                    this._itemTriggeredThisFrame = false;
                }
                return triggered;
            }
        },
        {
            // NEW: Method for PlayerManager to get the item type that should be used
            key: "getItemTypeToUse",
            value: function getItemTypeToUse() {
                var itemType = this._itemTypeToUseOnRelease;
                // Reset the stored type *after* it's been retrieved for use
                if (itemType) {
                    console.log("InputManager: getItemTypeToUse() returning ".concat(itemType, ", resetting stored type."));
                    this._itemTypeToUseOnRelease = null;
                }
                return itemType;
            }
        },
        {
            // Method to get raw key state if needed elsewhere (e.g., for holding drift)
            key: "isKeyDown",
            value: function isKeyDown(keyCode) {
                return this.keys[keyCode] || false;
            }
        }
    ]);
    return InputManager;
}();
