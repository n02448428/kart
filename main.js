import * as THREE from 'three';
import { GameWorld } from './gameWorld.js';
import { InputManager } from './inputManager.js';
import { AudioManager } from './audioManager.js';
import { UIManager } from './uiManager.js';
import { PlayerManager } from './playerManager.js';
import { RaceManager } from './raceManager.js';
import { ItemManager } from './itemManager.js';
// Get the render target
var renderDiv = document.getElementById('renderDiv');
// Set up game instance
var game = {
    width: renderDiv.clientWidth,
    height: renderDiv.clientHeight,
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(70, renderDiv.clientWidth / renderDiv.clientHeight, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({
        antialias: true
    }),
    clock: new THREE.Clock(),
    deltaTime: 0,
    gameOver: false,
    paused: false
};
// Configure renderer
game.renderer.setSize(game.width, game.height);
game.renderer.setClearColor(0x87CEEB);
game.renderer.shadowMap.enabled = true;
game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Enable outline post-processing for cel-shaded look
game.renderer.outputEncoding = THREE.sRGBEncoding;
renderDiv.appendChild(game.renderer.domElement);
// Prevent text selection and default drag behaviors on the body
document.body.style.userSelect = 'none'; // Standard
document.body.style.webkitUserSelect = 'none'; // Safari/Chrome
document.body.style.mozUserSelect = 'none'; // Firefox
document.body.style.msUserSelect = 'none'; // IE/Edge
document.body.style.webkitTouchCallout = 'none'; // Disable callout menu on iOS (body)
document.body.style.touchAction = 'none'; // Prevent default touch actions like scrolling/zooming on the main game area
// Also apply touch callout prevention directly to the renderDiv for extra safety on iOS
renderDiv.style.webkitTouchCallout = 'none';
// Apply user select prevention directly to the renderDiv as well
renderDiv.style.webkitUserSelect = 'none'; // Might help further suppress iOS magnifier/selection
// Add listener to prevent the context menu (often triggered by long press/double tap on iOS)
renderDiv.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
// Handle window resize
window.addEventListener('resize', function() {
    game.width = renderDiv.clientWidth;
    game.height = renderDiv.clientHeight;
    game.camera.aspect = game.width / game.height;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(game.width, game.height);
});
// Initialize managers
game.inputManager = new InputManager(game); // Pass game to constructor
game.audioManager = new AudioManager(game);
game.uiManager = new UIManager(game);
game.itemManager = new ItemManager(game);
// Create game world
game.world = new GameWorld(game);
// Create player manager (handles player and AI karts)
game.playerManager = new PlayerManager(game);
// Create race manager (handles checkpoints, laps, positions)
game.raceManager = new RaceManager(game);
// Game loop
function animate() {
    requestAnimationFrame(animate);
    if (game.paused) return;
    // Calculate delta time
    game.deltaTime = game.clock.getDelta();
    // Update game systems
    game.inputManager.update();
    game.world.update();
    game.playerManager.update();
    game.raceManager.update();
    game.itemManager.update();
    game.uiManager.update();
    // Render
    game.renderer.render(game.scene, game.camera);
}
// Start game
game.uiManager.initialize(); // Initialize UI elements first
game.playerManager.initialize(); // Now player manager can safely update UI
game.raceManager.initialize();
animate();
