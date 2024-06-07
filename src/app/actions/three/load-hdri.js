import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import * as THREE from "three";

export function hdri(hdri, renderer, scene) {
  new EXRLoader().load(hdri, function (texture) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = envMap;

    scene.environmentIntensity = 0.3;

    texture.dispose();
    pmremGenerator.dispose();
  });
}
