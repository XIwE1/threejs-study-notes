import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();


{
  const color = 'lightblue';
  const fog = new THREE.Fog(color, 1, 2);
  scene.fog = fog;
  scene.background = new THREE.Color(color);
}
{

  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight( color, intensity );
  light.position.set( - 1, 2, 4 );
  scene.add( light );
}

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function makeCubeInstance( geometry, color, x ) {
  const material = new THREE.MeshPhongMaterial( { color: color } );
  const cubeMesh = new THREE.Mesh( geometry, material );
  cubeMesh.position.x = x;
  scene.add( cubeMesh );
  return cubeMesh;
}

const cubes = [
  makeCubeInstance(geometry, 0x44aa88,  0),
  makeCubeInstance(geometry, 0x8844aa, -2),
  makeCubeInstance(geometry, 0xaa8844,  2),
];

function animation() {
  requestAnimationFrame(animation);
  cubes.forEach((cube) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  })
  renderer.render(scene, camera);
}
animation();
