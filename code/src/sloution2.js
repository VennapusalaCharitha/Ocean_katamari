const updateModelPosition = () => {
    let moveX = 0;
    let moveZ = 0;
  
    // Adjust movement based on key presses
    if (keysPressed['ArrowUp']) {
      // Move the sphere forward in the direction of the camera
      const forwardDirection = new THREE.Vector3(0, 0, -1);
      forwardDirection.applyQuaternion(camera.quaternion);
      forwardDirection.y = 0; // Set y component to 0 to avoid downward motion
      forwardDirection.normalize(); // Normalize the vector to maintain constant speed
      forwardDirection.multiplyScalar(speedFactor);
      porsche.position.add(forwardDirection);
    }
    if (keysPressed['ArrowDown']) {
      // Move the sphere backward in the opposite direction of the camera
      const backwardDirection = new THREE.Vector3(0, 0, 1);
      backwardDirection.applyQuaternion(camera.quaternion);
      backwardDirection.y = 0; // Set y component to 0 to avoid downward motion
      backwardDirection.normalize(); // Normalize the vector to maintain constant speed
      backwardDirection.multiplyScalar(speedFactor);
      porsche.position.add(backwardDirection);
    }
    if (keysPressed['ArrowLeft']) {
      // Move the sphere left perpendicular to the camera's forward direction
      const leftDirection = new THREE.Vector3(-1, 0, 0);
      leftDirection.applyQuaternion(camera.quaternion);
      leftDirection.y = 0; // Set y component to 0 to avoid downward motion
      leftDirection.normalize(); // Normalize the vector to maintain constant speed
      leftDirection.multiplyScalar(speedFactor);
      porsche.position.add(leftDirection);
    }
    if (keysPressed['ArrowRight']) {
      // Move the sphere right perpendicular to the camera's forward direction
      const rightDirection = new THREE.Vector3(1, 0, 0);
      rightDirection.applyQuaternion(camera.quaternion);
      rightDirection.y = 0; // Set y component to 0 to avoid downward motion
      rightDirection.normalize(); // Normalize the vector to maintain constant speed
      rightDirection.multiplyScalar(speedFactor);
      porsche.position.add(rightDirection);
    }
    // Adjust steering using A and D keys
    if (keysPressed['KeyA']) {
      porsche.rotation.y += Math.PI / 180; // Rotate left
    }
    if (keysPressed['KeyD']) {
      porsche.rotation.y -= Math.PI / 180; // Rotate right
    }
  
    // Update position within boundary
    const boundary = 100;
    const newX = porsche.position.x + moveX;
    const newZ = porsche.position.z + moveZ;
  
    if (Math.abs(newX) <= boundary && Math.abs(newZ) <= boundary) {
      porsche.position.x = newX;
      porsche.position.z = newZ;
    }
  
    // Camera follows the Porsche model
    const distance = 10;
    const offsetX = distance * Math.sin(porsche.rotation.y);
    const offsetZ = distance * Math.cos(porsche.rotation.y);
    const offsetY = 4;
  
    camera.position.set(porsche.position.x + offsetX, porsche.position.y + offsetY, porsche.position.z + offsetZ);
    camera.lookAt(porsche.position);
  };
  
  /////////////////////////////////////////////////////////////////////////////////////////////

  import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, porsche;
let keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let collectedSpheres = [];
let timerElement;
let timerInterval;
let timerSeconds = 30;
let gameStarted = false;
let spheresCollected = 0;
const speedFactor = 0.2;
let flashTimer = 0;
let blinkTimer = 0;
const blinkDuration = 1; // Blink duration in seconds

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
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
    moveZ -= speedFactor * 1.5;
    moveX -= speedFactor * 1.5;
  }
  if (keysPressed['ArrowDown']) {
    moveZ += speedFactor * 1.5;
    moveX += speedFactor * 1.5;
  }
  if (keysPressed['ArrowLeft']) {
    moveZ += speedFactor;
    moveX -= speedFactor * 2;
  }
  if (keysPressed['ArrowRight']) {
    moveZ -= speedFactor;
    moveX += speedFactor * 2;
  }

  if (moveX !== 0 && moveZ !== 0) {
    const sqrt2over2 = Math.sqrt(2) / 2;
    moveX *= sqrt2over2;
    moveZ *= sqrt2over2;
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

  // Check for collision with spheres
  const sphereRadius = 0.5;
  const modelBoundingBox = new THREE.Box3().setFromObject(porsche);
  collectedSpheres = collectedSpheres.filter((sphere) => {
    const spherePosition = sphere.position.clone().add(new THREE.Vector3(0, sphereRadius, 0)); // Offset by sphere radius
    if (modelBoundingBox.containsPoint(spherePosition)) {
      // Model collected the sphere
      scene.remove(sphere);
      blinkTimer = blinkDuration; // Start the blink timer
     
      spheresCollected++;
      return false; // Remove the collected sphere from the array
    }
    return true;
  });

  // Check if all spheres are collected
  if (collectedSpheres.length === 0) {
    gameOver();
  }
};

const blinkModel = () => {
  if (blinkTimer > 0) {
    // Toggle visibility
    porsche.visible = !porsche.visible;
    blinkTimer -= 1 / 60; // Decrease timer based on frame rate (assuming 60fps)
    setTimeout(blinkModel, 1000 / 60); // Recursive call for next frame
    porsche.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(0x00ff00);
      }
    });

  } else {
    // Reset model visibility and timer
    porsche.visible = true;
    blinkTimer = 0;
    porsche.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(0xFFFFFF);
      }
    });
    
  }
};



const gameOver = () => {
  const gameOverDiv = document.createElement('div');
  gameOverDiv.textContent = `Game Over! Spheres Collected: ${spheresCollected}`;
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
};

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);

  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  let directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
  scene.add(helper);

  const geometry = new THREE.PlaneGeometry(4, 4);
  const texture = new THREE.TextureLoader().load('./assets/ocean.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(50, 50);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(-Math.PI / 2);
  plane.rotateZ(Math.PI / 4);
  plane.scale.set(100, 100, 100);
  scene.add(plane);

  // Add spheres
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

  for (let i = 0; i < 20; i++) {
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }); // Random color for each sphere
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // Generate random positions for the spheres
    const randomX = Math.random() * 200 - 100; // Random x position between -100 and 100
    const randomZ = Math.random() * 200 - 100; // Random z position between -100 and 100
    sphere.position.set(randomX, 0.5, randomZ); // Set y position to 0.5 (half of sphere's diameter)
    scene.add(sphere);
    collectedSpheres.push(sphere);
  }

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

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
};

let wave = 1;
let i = 1;
window.loop = (dt, input) => {
  if (porsche) {
    updateModelPosition();
    porsche.rotation.x += (wave - dt) * 0.0002;
    porsche.rotation.y -= (wave - dt) * 0.0004;
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
    camera.position.x += 2;
    camera.position.z += 2;
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
