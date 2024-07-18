import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let renderer, scene, camera, porsche;
let keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let collectedModels = [];
let timerElement;
let timerInterval;
let timerSeconds = 30;
let gameStarted = false;
let modelsCollected = 0;
let speedFactor = 0.01;
const acceleration = 0.001;
let friction = 0.99;
let gameControl = true;
let flashTimer = 0;
let blinkTimer = 0;
let scoreElement = 0;
let highScoreElement;
let highScore;
const blinkDuration = 1; // Blink duration in seconds

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(
    url,
    (gltf) => resolve(gltf.scene), // Resolve promise with the loaded scene
    undefined, // No progress callback needed
    (error) => reject(error) // Reject promise with the error
  );
});

const handleKeyDown = (event) => {
  keysPressed[event.key] = true;
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }
};

const handleKeyUp = (event) => {
  keysPressed[event.key] = false;
};

const startTimer = () => {
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
};

const updateTimerDisplay = () => {
  timerElement.textContent = `Time : ${timerSeconds}`;
  if (timerSeconds <= 20) {
    // Blink effect
    if (flashTimer <= 0) {
      timerElement.style.color = 'red';
      timerElement.style.backgroundColor = 'white';
      flashTimer = blinkDuration;
    } else {
      timerElement.style.color = 'white';
      timerElement.style.backgroundColor = 'red';
      flashTimer -= 1;
    }
  } else {
    timerElement.style.color = 'white';
    timerElement.style.visibility = 'visible';
  }
};

const updateModelPosition = () => {
  let moveX = 0;
  let moveZ = 0;

  if (keysPressed['ArrowUp']) {
    if (speedFactor < 0.2) {
      speedFactor += acceleration;
    }
    moveZ -= speedFactor;
    moveX -= speedFactor;
  }
  if (keysPressed['ArrowDown']) {
    if (speedFactor < 0.2) {
      speedFactor += acceleration;
    }
    moveZ += speedFactor;
    moveX += speedFactor;
  }
  if (keysPressed['ArrowLeft']) {
    if (speedFactor < 0.2) {
      speedFactor += acceleration;
    }
    moveZ += speedFactor;
    moveX -= speedFactor;
  }
  if (keysPressed['ArrowRight']) {
    if (speedFactor < 0.2) {
      speedFactor += acceleration;
    }
    moveZ -= speedFactor;
    moveX += speedFactor;
  }

  if (moveX !== 0 && moveZ !== 0) {
    const sqrt2over2 = Math.sqrt(2) / 2;
    moveX *= sqrt2over2;
    moveZ *= sqrt2over2;
  }

  speedFactor *= friction;
  if (speedFactor < 0) {
    speedFactor = 0;
  }
  // Update position within boundary
  const boundary = 100; // Set the boundary size
  const newX = porsche.position.x + moveX;
  const newZ = porsche.position.z + moveZ;

  // Check if the new position is within the boundary
  if (Math.abs(newX) <= boundary && Math.abs(newZ) <= boundary) {
    porsche.position.x = newX;
    porsche.position.z = newZ;
  }

  // Update rotation
  porsche.rotation.x += moveZ * 0.5;
  porsche.rotation.y -= moveX * 0.5;

  // Check for collision with models
  const modelBoundingBox = new THREE.Box3().setFromObject(porsche);
  collectedModels = collectedModels.filter((model) => {
    if (modelBoundingBox.intersectsBox(model.boundingBox)) {
      // Model collected
      scene.remove(model);
      blinkTimer = blinkDuration; // Start the blink timer
      modelsCollected++;
      timerSeconds += 1;
      updateScoreDisplay();
      updateHighScore();
      increaseTimerDisplay(); // Inform the player about the time increase
      return false; // Remove the collected model from the array
    }
    return true;
  });
  if (collectedModels.length === 0) {
    // Spawn five more models in random locations
    loadRandomModels();
  }
};

const updateScoreDisplay = () => {
  scoreElement.textContent = `Score: ${modelsCollected}`;
};

const increaseTimerDisplay = () => {
  const increaseElement = document.createElement('div');
  increaseElement.textContent = '+1  sec';
  increaseElement.style.position = 'absolute';
  increaseElement.style.top = '15px'; // Adjust top position
  increaseElement.style.left = '50%';
  increaseElement.style.transform = 'translateX(60px)';
  increaseElement.style.fontSize = '24px';
  increaseElement.style.fontFamily = 'Roboto, sans-serif';
  increaseElement.style.fontWeight = 'bold';
  increaseElement.style.color = ' #2dc937';
  document.body.appendChild(increaseElement);

  // Remove the element after 2 seconds
  setTimeout(() => {
    document.body.removeChild(increaseElement);
  }, 2000);
};

const blinkModel = () => {
  if (blinkTimer > 0) {
    // Toggle visibility
    porsche.visible = !porsche.visible;
    blinkTimer -= 1 / 60; // Decrease timer based on frame rate (assuming 60fps)
    setTimeout(blinkModel, 1000 / 60); // Recursive call for next frame
  } else {
    // Reset model visibility and timer
    porsche.visible = true;
    blinkTimer = 0;
  }
};

const gameOver = () => {
  const gameOverDiv = document.createElement('div');
  gameOverDiv.textContent = `Game Over! SCORE : ${modelsCollected}  HIGH SCORE : ${highScore}`;
  gameOverDiv.style.position = 'absolute';
  gameOverDiv.style.top = '50%';
  gameOverDiv.style.left = '50%';
  gameOverDiv.style.transform = 'translate(-50%, -50%)';
  gameOverDiv.style.fontSize = '48px';
  gameOverDiv.style.color = 'white';
  gameOverDiv.style.backgroundColor = 'black'; // Change background color
  gameOverDiv.style.padding = '20px'; // Add padding
  gameOverDiv.style.borderRadius = '10px'; // Add border radius
  document.body.appendChild(gameOverDiv);
  gameControl = false;
};


// Function to update high score
const updateHighScore = () => {
  if (modelsCollected > highScore) {
    highScore = modelsCollected;
    localStorage.setItem('highScore', highScore); // Store high score in local storage
    highScoreElement.textContent = `High Score: ${highScore}`;
  }
};

window.init = async () => {
  highScore = parseInt(localStorage.getItem('highScore')) || 0
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  // Light setup
  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  // Ground setup
  const geometry = new THREE.PlaneGeometry(4, 4);
  const texture = new THREE.TextureLoader().load('./assets/ocean.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 40);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.rotateZ(Math.PI / 4);
  plane.scale.set(100, 100, 100);
  scene.add(plane);

  // Add random models
  const loadRandomModels = async () => {
    const modelPaths = [
      './assets/2/scene.gltf',
      './assets/3/scene.gltf',
      './assets/4/scene.gltf',
      './assets/5/scene.gltf'
    ];
    const modelIndex = Math.floor(Math.random() * modelPaths.length);
    const modelPath = modelPaths[modelIndex];


    try {
      const model = await load(modelPath);

      // Set the initial position of the model
      const randomX = Math.random() * 200 - 100; // Random x position between -100 and 100
      const randomZ = Math.random() * 200 - 100; // Random z position between -100 and 100
      model.position.set(randomX, 0.5, randomZ); // Set y position to 0.5 (half of model's height)

      // Calculate bounding box for collision detection
      model.boundingBox = new THREE.Box3().setFromObject(model);
      if (modelPath === './assets/4/scene.gltf') {
        model.scale.set(0.1, 0.1, 0.1);
      }

      if (modelPath === './assets/1/scene.gltf') {
        model.scale.set(3, 3, 3);
      }

      if (modelPath === './assets/5/scene.gltf') {
        model.scale.set(3, 3, 3);
      }

      scene.add(model);
      collectedModels.push(model); // Add the loaded model to the array
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  // Load random models
  for (let i = 0; i < 20; i++) {
    await loadRandomModels();
  }

  // Add the Porsche model
  porsche = await load('./assets/robosphere/scene.gltf');
  scene.add(porsche);

  // Adjust the initial position of the Porsche model
  if (porsche) {
    porsche.position.y = 1; // Adjust this value to place it higher or lower above the X-Z plane
  }

  // Create and append timer element to the document
  timerElement = document.createElement('div');
  timerElement.textContent = `Time : ${timerSeconds}`;
  timerElement.style.position = 'absolute';
  timerElement.style.top = '10px'; // Adjust top position
  timerElement.style.left = '50%';
  timerElement.style.transform = 'translateX(-50%)'; // Center horizontally
  timerElement.style.fontSize = '24px';
  timerElement.style.fontFamily = 'Roboto, sans-serif';
  timerElement.style.fontWeight = 'bold';
  timerElement.style.paddingTop = '5px';
  timerElement.style.paddingBottom = '5px';
  timerElement.style.paddingRight = '25px';
  timerElement.style.paddingLeft = '25px';
  timerElement.style.borderRadius = '20px';
  timerElement.style.backgroundColor = 'green';
  timerElement.style.color = 'white';
  document.body.appendChild(timerElement);


  // Create and append score element to the document
  scoreElement = document.createElement('div');
  scoreElement.textContent = `Score: ${modelsCollected}`;
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '10px'; // Adjust top position
  scoreElement.style.right = '10px'; // Adjust right position
  scoreElement.style.fontSize = '24px';
  scoreElement.style.fontFamily = 'Roboto, sans-serif';
  scoreElement.style.fontWeight = 'bold';
  scoreElement.style.color = 'white';
  document.body.appendChild(scoreElement);

  // Create and append high score element to the document
  highScoreElement = document.createElement('div');
  highScoreElement.textContent = `High Score: ${localStorage.getItem('highScore') || 0}`;
  highScoreElement.style.position = 'absolute';
  highScoreElement.style.top = '10px'; // Adjust top position
  highScoreElement.style.left = '10px'; // Adjust left position
  highScoreElement.style.fontSize = '24px';
  highScoreElement.style.fontFamily = 'Roboto, sans-serif';
  highScoreElement.style.fontWeight = 'bold';
  highScoreElement.style.color = 'white';
  document.body.appendChild(highScoreElement);

  // Create mini-map canvas
  const miniMapCanvas = document.createElement('canvas');
  miniMapCanvas.width = 200;
  miniMapCanvas.height = 200;
  miniMapCanvas.style.position = 'absolute';
  miniMapCanvas.style.bottom = '10px';
  miniMapCanvas.style.left = '10px';
  miniMapCanvas.style.border = '1px solid white';
  miniMapCanvas.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Example: semi-transparent black
  document.body.appendChild(miniMapCanvas);

  // Get 2D context of mini-map canvas
  const miniMapContext = miniMapCanvas.getContext('2d');

  // Render mini-map
  const renderMiniMap = () => {
    miniMapContext.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);

    const centerX = miniMapCanvas.width / 2;
    const centerY = miniMapCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5; // Subtracting 5 to leave some padding

    // Render circular boundary
    miniMapContext.strokeStyle = 'white';
    miniMapContext.lineWidth = 2;
    miniMapContext.beginPath();
    miniMapContext.arc(centerX, centerY, radius, 0, Math.PI * 2);
    miniMapContext.stroke();

    // Render objects and player position
    scene.traverse((object) => {
      const posX = centerX + (object.position.x / 200) * radius;
      const posY = centerY + (object.position.z / 200) * radius;

      if (object !== porsche) {
        // Render objects
        miniMapContext.fillStyle = 'red';
        miniMapContext.beginPath();
        miniMapContext.arc(posX, posY, 3, 0, Math.PI * 2);
        miniMapContext.fill();
      } else {
        // Render player position
        miniMapContext.fillStyle = 'blue';
        miniMapContext.beginPath();
        miniMapContext.arc(posX, posY, 5, 0, Math.PI * 2);
        miniMapContext.fill();
      }
    });
  };


  // Main loop
  const mainLoop = () => {
    if (porsche) {
      if (gameControl) {
        updateModelPosition();
        blinkModel();
      }

      camera.position.copy(porsche.position);
      camera.position.x += 2;
      camera.position.z += 2;
      camera.position.y += 4;

      renderer.render(scene, camera);

      renderMiniMap();
    }
    requestAnimationFrame(mainLoop);
  };

  mainLoop();


  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
};

let wave = 1;
let i = 1;
window.loop = (dt, input) => {
  if (porsche) {
    if (gameControl) {
      updateModelPosition();
      porsche.rotation.x += (wave - dt) * 0.0002;
      porsche.rotation.y -= (wave - dt) * 0.0004;
    } else {
      porsche.rotation.x += (wave - dt) * 0.001;
      porsche.rotation.y -= (wave - dt) * 0.002;
    }

    if (i % 30 == 0) {
      wave *= -1 * 0.5;
    }
    if (i % 31 == 0) {
      wave *= 2;
    }
    let wavedirect = Math.random();

    if (0 < wavedirect < 0.25) {
      porsche.position.x += wave * dt * 0.0001;
    } else if (0.25 < wavedirect < 0.50) {
      porsche.position.z += wave * dt * 0.0005;
    } else if (0.50 < wavedirect < 0.70) {
      porsche.position.x += wave * dt * 0.0002;
    } else if (0.70 < wavedirect < 0.75) {
      porsche.position.x += wave * dt * 0.0001;
    } else if (0.75 < wavedirect < 1) {
      porsche.position.z += wave * Math.sin(dt) * 0.0002;
    }
    if (porsche.position.y > 1.25 || porsche.position.y < 0.75) {
      porsche.position.y == 1;
    }

    porsche.position.y += Math.sin(dt) * wave * 0.005;

    // Handle model blinking
    blinkModel();

    // Set camera position to follow the Porsche model
    camera.position.copy(porsche.position);
    camera.position.x += 3;
    camera.position.z += 3;
    camera.position.y += 4; // Adjust the height of the camera

    // Render the scene
    renderer.render(scene, camera);
  }
  if (i == 3300) {
    i = 1;
    wave = 1;
  }
  i += 1;
};