function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
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
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
export var UIManager = /*#__PURE__*/ function() {
    "use strict";
    function UIManager(game) {
        _class_call_check(this, UIManager);
        this.game = game;
        this.elements = {};
    }
    _create_class(UIManager, [
        {
            key: "initialize",
            value: function initialize() {
                this.createHUD();
            }
        },
        {
            key: "createHUD",
            value: function createHUD() {
                // Create HUD elements in the DOM
                var hud = document.createElement('div');
                hud.style.position = 'absolute';
                hud.style.top = '10px';
                hud.style.left = '10px';
                hud.style.color = 'white';
                hud.style.textShadow = '1px 1px 2px black';
                hud.style.fontFamily = 'Arial, sans-serif';
                hud.style.fontSize = '18px';
                hud.style.pointerEvents = 'none';
                hud.style.zIndex = '10';
                // Create minimap container
                var minimapContainer = document.createElement('div');
                minimapContainer.id = 'minimap-container';
                minimapContainer.style.position = 'absolute';
                minimapContainer.style.top = '10px';
                minimapContainer.style.right = '10px';
                minimapContainer.style.width = '150px';
                minimapContainer.style.height = '150px';
                minimapContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                minimapContainer.style.borderRadius = '75px';
                minimapContainer.style.overflow = 'hidden';
                minimapContainer.style.zIndex = '10';
                minimapContainer.style.border = '2px solid white';
                document.body.appendChild(minimapContainer);
                // Create canvas for the minimap
                var minimapCanvas = document.createElement('canvas');
                minimapCanvas.id = 'minimap';
                minimapCanvas.width = 150;
                minimapCanvas.height = 150;
                minimapCanvas.style.width = '100%';
                minimapCanvas.style.height = '100%';
                minimapContainer.appendChild(minimapCanvas);
                this.minimapContext = minimapCanvas.getContext('2d');
                this.minimapCanvas = minimapCanvas;
                // Position element
                var position = document.createElement('div');
                position.id = 'position';
                position.textContent = 'Position: 1st';
                hud.appendChild(position);
                this.elements.position = position;
                // Lap counter
                var laps = document.createElement('div');
                laps.id = 'laps';
                laps.textContent = 'Lap: 1/3';
                hud.appendChild(laps);
                this.elements.laps = laps;
                // Current item
                var item = document.createElement('div');
                item.id = 'item';
                item.textContent = 'Item: None';
                hud.appendChild(item);
                this.elements.item = item;
                // Speed display
                var speed = document.createElement('div');
                speed.id = 'speed';
                speed.textContent = 'Speed: 0 km/h';
                hud.appendChild(speed);
                this.elements.speed = speed;
                document.body.appendChild(hud);
                // Create controls guide for desktop
                // On-screen controls are now handled by direct touch input
                this.createControlsGuide();
            }
        },
        {
            // REMOVED createOnScreenControls() function entirely
            key: "createControlsGuide",
            value: function createControlsGuide() {
                // Detect if likely mobile (simple check)
                var isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
                if (isMobile) {
                    // Don't create the guide on mobile
                    return;
                }
                var guideContainer = document.createElement('div');
                guideContainer.style.position = 'absolute';
                guideContainer.style.top = '50%';
                guideContainer.style.right = '20px';
                guideContainer.style.transform = 'translateY(-50%)';
                guideContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                guideContainer.style.color = 'white';
                guideContainer.style.padding = '10px';
                guideContainer.style.borderRadius = '5px';
                guideContainer.style.fontFamily = 'Arial, sans-serif';
                guideContainer.style.fontSize = '14px';
                guideContainer.style.zIndex = '10';
                guideContainer.style.maxWidth = '200px';
                var title = document.createElement('div');
                title.textContent = 'KEYBOARD CONTROLS';
                title.style.fontWeight = 'bold';
                title.style.marginBottom = '5px';
                title.style.textAlign = 'center';
                guideContainer.appendChild(title);
                var controls = [
                    [
                        '↑',
                        'Accelerate'
                    ],
                    [
                        '↓',
                        'Brake/Reverse'
                    ],
                    [
                        '←',
                        'Turn Left'
                    ],
                    [
                        '→',
                        'Turn Right'
                    ],
                    [
                        'SPACE',
                        'Drift'
                    ],
                    [
                        'X',
                        'Use Item'
                    ]
                ];
                var list = document.createElement('div');
                controls.forEach(function(param) {
                    var _param = _sliced_to_array(param, 2), key = _param[0], action = _param[1];
                    var row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.margin = '3px 0';
                    var keyElem = document.createElement('span');
                    keyElem.textContent = key;
                    keyElem.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    keyElem.style.padding = '2px 5px';
                    keyElem.style.borderRadius = '3px';
                    keyElem.style.marginRight = '10px';
                    keyElem.style.minWidth = '40px';
                    keyElem.style.textAlign = 'center';
                    var actionElem = document.createElement('span');
                    actionElem.textContent = action;
                    row.appendChild(keyElem);
                    row.appendChild(actionElem);
                    list.appendChild(row);
                });
                guideContainer.appendChild(list);
                // Add hide/show functionality
                var hideBtn = document.createElement('button');
                hideBtn.textContent = 'Hide';
                hideBtn.style.marginTop = '5px';
                hideBtn.style.padding = '3px 8px';
                hideBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                hideBtn.style.border = 'none';
                hideBtn.style.borderRadius = '3px';
                hideBtn.style.color = 'white';
                hideBtn.style.cursor = 'pointer';
                hideBtn.style.width = '100%';
                hideBtn.style.pointerEvents = 'auto';
                var isHidden = false;
                hideBtn.addEventListener('click', function() {
                    if (isHidden) {
                        list.style.display = 'block';
                        hideBtn.textContent = 'Hide';
                    } else {
                        list.style.display = 'none';
                        hideBtn.textContent = 'Show Controls';
                    }
                    isHidden = !isHidden;
                });
                guideContainer.appendChild(hideBtn);
                document.body.appendChild(guideContainer);
            }
        },
        {
            key: "updatePosition",
            value: function updatePosition(position) {
                var suffix = this.getPositionSuffix(position);
                this.elements.position.textContent = "Position: ".concat(position).concat(suffix);
            }
        },
        {
            key: "updateLap",
            value: function updateLap(current, total) {
                this.elements.laps.textContent = "Lap: ".concat(current, "/").concat(total);
            }
        },
        {
            key: "updateItem",
            value: function updateItem(item) {
                this.elements.item.textContent = "Item: ".concat(item || 'None');
            }
        },
        {
            key: "updateSpeed",
            value: function updateSpeed(speed) {
                this.elements.speed.textContent = "Speed: ".concat(Math.round(speed), " km/h");
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
            key: "drawMinimap",
            value: function drawMinimap() {
                if (!this.minimapContext || !this.game.world.trackCurve) return;
                var ctx = this.minimapContext;
                var canvas = this.minimapCanvas;
                var width = canvas.width;
                var height = canvas.height;
                var centerX = width / 2;
                var centerY = height / 2;
                var scale = 0.8; // Scale to fit the map nicely
                // Clear canvas
                ctx.clearRect(0, 0, width, height);
                // Draw background
                ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
                ctx.beginPath();
                ctx.arc(centerX, centerY, width / 2, 0, Math.PI * 2);
                ctx.fill();
                // Get track points
                var trackPoints = this.game.world.trackCurve.getPoints(100);
                // Find bounds to scale the map properly
                var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
                trackPoints.forEach(function(point) {
                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minZ = Math.min(minZ, point.z);
                    maxZ = Math.max(maxZ, point.z);
                });
                var rangeX = maxX - minX;
                var rangeZ = maxZ - minZ;
                var maxRange = Math.max(rangeX, rangeZ);
                var scaleFactor = width * scale / maxRange;
                // Draw track outline
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.beginPath();
                trackPoints.forEach(function(point, index) {
                    // Map 3D coords to 2D minimap
                    var x = centerX + (point.x - (minX + rangeX / 2)) * scaleFactor;
                    var y = centerY + (point.z - (minZ + rangeZ / 2)) * scaleFactor;
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                // Close the path
                ctx.closePath();
                ctx.stroke();
                // Mark start line
                var startPoint = trackPoints[0];
                var startX = centerX + (startPoint.x - (minX + rangeX / 2)) * scaleFactor;
                var startY = centerY + (startPoint.z - (minZ + rangeZ / 2)) * scaleFactor;
                ctx.fillStyle = 'green';
                ctx.beginPath();
                ctx.arc(startX, startY, 5, 0, Math.PI * 2);
                ctx.fill();
                // Draw all karts
                this.game.playerManager.karts.forEach(function(kart) {
                    var x = centerX + (kart.object.position.x - (minX + rangeX / 2)) * scaleFactor;
                    var y = centerY + (kart.object.position.z - (minZ + rangeZ / 2)) * scaleFactor;
                    // Choose color based on whether it's player or AI
                    ctx.fillStyle = kart.isPlayer ? 'red' : 'blue';
                    // Draw direction indicator (triangle)
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(kart.object.rotation.y);
                    ctx.beginPath();
                    ctx.moveTo(0, -6); // Point in front of kart
                    ctx.lineTo(-3, 3); // Back-left
                    ctx.lineTo(3, 3); // Back-right
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                });
            }
        },
        {
            key: "update",
            value: function update() {
                // Get player data from player manager
                var playerKart = this.game.playerManager.playerKart;
                if (playerKart) {
                    this.updateSpeed(playerKart.speed); // No multiplier needed - show actual speed
                }
                // Get race data from race manager
                var raceManager = this.game.raceManager;
                if (raceManager) {
                    this.updatePosition(raceManager.getPlayerPosition());
                    this.updateLap(raceManager.getPlayerLap(), raceManager.totalLaps);
                }
                // Get item data
                if (playerKart) {
                    this.updateItem(playerKart.currentItem);
                }
                // Update minimap
                this.drawMinimap();
            }
        }
    ]);
    return UIManager;
}();
