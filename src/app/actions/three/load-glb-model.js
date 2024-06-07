import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";

export const loadGLBModel = (path, scenario, setIsLoading, textures) => {
  const loader = new GLTFLoader();
  //const textureLoader = new THREE.TextureLoader();

  const objectNames = []; // Array para armazenar os nomes dos objetos

  // Load normal and roughness maps
  //const normalMap = textureLoader.load("/normal.png");
  //const roughnessMap = textureLoader.load("/roughness.png");

  loader.load(
    path,
    function (gltf) {
      // Ajuste da posição inicial da cena do modelo
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          if (child.name.includes("TEXT")) {
            child.material.normalMap = textures.normalMap;
            child.material.roughnessMap = textures.roughnessMap;
            child.material.transmissionMap = textures.transmissionMap;
          }
          child.material.opacity = 0;
          child.material.transparent = true;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;

          objectNames.push(child.name); // Adiciona o nome ao array
        }
      });

      // Adiciona a cena completa ao cenário
      scenario.add(gltf.scene);

      // Inicia a animação da escala da cena completa

      new TWEEN.Tween({ x: 0, y: 0, z: 0 })
        .to({ x: 1.1, y: 1.1, z: 1.1 }, 1610)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((scale) => {
          gltf.scene.scale.set(scale.x, scale.y, scale.z);
        })
        .delay(100)
        .start();

      new TWEEN.Tween({ opacity: 0 })
        .to({ opacity: 1 }, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((object) => {
          // Update opacity of meshes in gltf.scene
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.transparent = true; // Ensure material is transparent
              child.material.opacity = object.opacity;
            }
          });
        })
        .delay(600)
        .start();

      new TWEEN.Tween({ x: 0, y: 0, z: 0 })
        .to({ x: 0, y: Math.PI * 2, z: 0 }, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((rotation) => {
          gltf.scene.rotation.set(rotation.x, rotation.y, rotation.z);
        })
        .delay(600)
        .start();

      setIsLoading(false);
    },
    undefined,
    function (error) {
      setIsLoading(false);
      console.log(error);
    }
  );
};
