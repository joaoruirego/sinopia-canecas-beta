import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { hdri } from "./load-hdri";

export function createSceneLayout() {
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(2);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f4f4);

  const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 25;
  camera.position.y = 5;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
  /*
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffee, 2);
  hemisphereLight.position.y = 20;
  scene.add(hemisphereLight);
  */
  const directionalLightBack = new THREE.DirectionalLight(0xffffff, 1.5); // luz para se ver à frente
  directionalLightBack.position.set(0, 0, -20);
  directionalLightBack.lookAt(0, 0, 0);
  scene.add(directionalLightBack);

  const directionalLightFront = new THREE.DirectionalLight(0xffffff, 1.8); // luz para se ver à frente
  directionalLightFront.position.set(0, 0, 20);
  directionalLightFront.lookAt(0, 0, 0);
  scene.add(directionalLightFront);

  const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 0.8); // luz para se ver à frente
  directionalLightLeft.position.set(20, 0, 0);
  directionalLightLeft.lookAt(0, 0, 0);
  scene.add(directionalLightLeft);

  const directionalLightRight = new THREE.DirectionalLight(0xffffff, 0.8); // luz para se ver à frente
  directionalLightRight.position.set(-20, 0, 0);
  directionalLightRight.lookAt(0, 0, 0);
  scene.add(directionalLightRight);

  const directionalLightTop = new THREE.DirectionalLight(0xffffff, 1.8); // luz para se ver à frente
  directionalLightTop.position.set(0, 10, 0);
  directionalLightTop.lookAt(0, 0, 0);
  scene.add(directionalLightTop);

  const directionalLightBottom = new THREE.DirectionalLight(0xffffff, 0.8); // luz para se ver à frente
  directionalLightBottom.position.set(0, -20, 0);
  directionalLightBottom.lookAt(0, 0, 0);
  //scene.add(directionalLightBottom);
  //directionalLight.castShadow = true;
  //directionalLight2.castShadow = true;
  /*
  const areaLightFront = new THREE.RectAreaLight(0xffffff, 2, 10, 10);
  areaLightFront.position.setZ(25);
  areaLightFront.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightFront);
*/
  /*const areaLightBack = new THREE.RectAreaLight(0xccffaa, 5, 10, 10);
  areaLightBack.position.setZ(-25);
  areaLightBack.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightBack);

  const areaLightTop = new THREE.RectAreaLight(0xccffaa, 5, 10, 10);
  areaLightTop.position.setY(25);
  areaLightTop.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightTop);
  /*
  const areaLightBottom = new THREE.RectAreaLight(0xffffff, 2, 10, 10);
  areaLightBottom.position.setY(-25);
  areaLightBottom.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightBottom);
*/
  /*const areaLightRight = new THREE.RectAreaLight(0xccffaa, 7, 10, 10);
  areaLightRight.position.setX(-25);
  areaLightRight.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightRight);
  /*
  const areaLightLeft = new THREE.RectAreaLight(0xffffff, 7, 10, 10);
  areaLightLeft.position.setX(25);
  areaLightLeft.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightLeft);
*/
  /*const areaLightBack = new THREE.RectAreaLight(0xffffff, 1, 10, 10);
  areaLightBack.position.set(0, 0, -8);
  areaLightBack.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(areaLightBack);*/

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 0, 0);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.161;
  orbit.screenSpacePanning = false;
  orbit.maxPolarAngle = Math.PI / 1.61; // nao deixa ir o user ver por baixo do hoodie, so o suficiente
  orbit.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: null,
  };
  orbit.enablePan = false;
  orbit.enabled = true;
  orbit.minDistance = 5;
  orbit.maxDistance = 25;

  //scene.fog = new THREE.FogExp2(0xf4f4f4, 0.0161);

  scene.environment = hdri("/hdri4.exr", renderer, scene);
  scene.environmentIntensity = 1;

  return {
    scene: scene,
    renderer: renderer,
    orbit: orbit,
    camera: camera,
  };
}
