import "./style.css"
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// renderer
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// postprocessing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0020;
composer.addPass(rgbShiftPass);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/autumn_ground_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});


// GLTF loader
const loader = new GLTFLoader();

let model;

loader.load(
  '/DamagedHelmet.gltf',
  (gltf) => {
    model = scene.add(gltf.scene);
  },
  (progress) => {
    console.log((progress.loaded / progress.total * 100) + '% loaded');
  },
  (error) => {
    console.error('An error happened', error);
  }
);

window.addEventListener('mousemove', (e) => {
  const mouseX = (e.clientX / window.innerWidth -.5) * Math.PI;
  const mouseY = (e.clientY / window.innerHeight -.5) * Math.PI;

  model.rotation.x = mouseY;
  model.rotation.y = mouseX;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});


function animate() {
  window.requestAnimationFrame(animate);
  controls.update();
  composer.render();
}
animate();

// handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
