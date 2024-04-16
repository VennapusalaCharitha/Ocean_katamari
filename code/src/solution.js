import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, porsche;
let keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
const speedFactor = 0.1;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

const handleKeyDown = (event) => {
  keysPressed[event.key] = true;
};

const handleKeyUp = (event) => {
  keysPressed[event.key] = false;
};

const updateModelPosition = () => {
  let moveX = 0;
  let moveZ = 0;

  if (keysPressed['ArrowUp']) {
    moveZ -= speedFactor*1.5;
    moveX -= speedFactor*1.5;

  }
  if (keysPressed['ArrowDown']) {
    moveZ += speedFactor*1.5;
    moveX += speedFactor*1.5;
  }
  if (keysPressed['ArrowLeft']) {
    moveZ += speedFactor;
    moveX -= speedFactor*2;
    
  }
  if (keysPressed['ArrowRight']) {
    moveZ -= speedFactor;
    moveX += speedFactor*2;
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
};

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
  
  camera.position.set(5, 5, 5);

  camera.lookAt(0, 0, 0);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
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

  //const gridHelper = new THREE.GridHelper(10, 10);
  //scene.add(gridHelper);

  //const axesHelper = new THREE.AxesHelper(5);
  //scene.add(axesHelper);

  porsche = await load('./assets/robosphere/scene.gltf');
  scene.add(porsche);

  // Adjust the initial position of the Porsche model
  if (porsche) {
    porsche.position.y = 1; // Adjust this value to place it higher or lower above the X-Z plane
  }

  console.log('made a scene', porsche);

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
};
let wave = 1;
let i = 1;
window.loop = (dt, input) => {
  if (porsche) {

    updateModelPosition();
    porsche.rotation.x += dt* 0.001;
    porsche.rotation.y -= dt* 0.003;
    if (i%30==0){
          wave *= -1*0.5;
    }
    if (i%31==0){
      wave *= 2;
    }
    console.log(i);
    let wavedirect = Math.random();
    console.log(wavedirect)

    if(0<wavedirect<0.25){
      porsche.position.x += wave*dt* 0.003;
    }
    else if(0.25<wavedirect<0.50){
      porsche.position.z += wave*dt* 0.0001;
    }
    else if(0.50<wavedirect<0.70){
      porsche.position.x += wave*dt* 0.0001
    }
    else if(0.70<wavedirect<0.75){
      porsche.position.x += wave*dt* 0.0001
    }
    else if(0.75<wavedirect<1){
      porsche.position.z += wave*Math.sin(dt)* 0.0002;
    }
    if(porsche.position.y>1.25 || porsche.position.y<0.75 ){
      porsche.position.y==1;
    }

    porsche.position.y += Math.sin(dt)*wave* 0.01;
    // Set camera position to follow the Porsche model
    camera.position.copy(porsche.position);
    camera.position.x += 2;
    camera.position.z += 2;
    camera.position.y += 4;// Adjust the height of the camera
  }
  if(i==3300){
    console.log("i is 3000");
    i=1;
    wave=1;
  }
  i+=1
  renderer.render(scene, camera);
};