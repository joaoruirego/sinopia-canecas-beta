"use client";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import NextImage from "next/image";
import styles from "../../../styles/page.module.css";
import logoStep from "../../../../public/logoStep.png";
import copyIcon from "../../../imgs/icons/copy.png";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { fetchScene } from "../../actions/firebasee/fetch-scene";
import { loadGLBModel } from "../../actions/three/load-glb-model";
import { createSceneLayout } from "../../actions/three/create-scene-layout";
import { getTextures } from "../../actions/misc/get-textures";
import { db } from "@/src/firebase";
import { getDoc, doc } from "firebase/firestore";
import { getBase64Data } from "../../actions/firebasee/get-base-64-data";
import { sortObjectsByIndex } from "../../actions/canvas/sort-objects-by-index";

const FabricCanvas = ({ canvasRef }) => {
  return <canvas ref={canvasRef}></canvas>;
};

const Visualize = ({ params }) => {
  const canvasRefs = useRef({});
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  let orbit;

  const model = params.id[params.id.length - 1];

  const modelUrls = {
    1: "/glbs/meshes/hoodie11.glb",
    2: "/glbs/meshes/1.glb",
    3: "/glbs/meshes/2.glb",
    4: "/glbs/meshes/3.glb",
    5: "/glbs/meshes/4.glb",
  };

  const url = modelUrls[model] || null;

  let mesh = useRef(null);

  useEffect(() => {
    const textures = getTextures();

    const sceneLayout = createSceneLayout();
    const scene = sceneLayout.scene;
    const camera = sceneLayout.camera;
    const renderer = sceneLayout.renderer;
    orbit = sceneLayout.orbit;
    containerRef.current.appendChild(renderer.domElement);
    loadGLBModel(url, scene, setIsLoading, textures);

    const initializeCanvas = async () => {
      const sceneDataArray = await fetchScene(params);

      if (!sceneDataArray || !Array.isArray(sceneDataArray)) {
        return;
      }
      sceneDataArray.forEach((sceneData, index) => {
        const { width, height, backgroundColor, texts, images, part } =
          sceneData;

        const canvas = new fabric.Canvas(`${part}`, {
          width,
          height,
        });

        canvas.setBackgroundColor(
          backgroundColor,
          canvas.renderAll.bind(canvas)
        );

        canvas.backgroundColor = backgroundColor;

        if (texts && texts.length > 0) {
          texts.forEach(
            ({ text, fontFamily, color, top, left, fontSize, index }) => {
              const textObject = new fabric.Textbox(text, {
                fontFamily,
                fontSize,
                fill: color,
                left,
                top,
                originX: "center",
                originY: "center",
                index,
              });
              canvas.add(textObject);
            }
          );
        }

        if (images && images.length > 0) {
          images.forEach(
            ({
              base64,
              top,
              left,
              width,
              height,
              scaleX,
              scaleY,
              angle,
              flipX,
              index,
            }) => {
              getBase64Data(base64)
                .then((base64String) => {
                  if (base64String) {
                    fabric.Image.fromURL(
                      base64String,
                      (img) => {
                        img.set({
                          left,
                          top,
                          scaleX,
                          scaleY,
                          width,
                          height,
                          angle,
                          originX: "center",
                          originY: "center",
                          flipX,
                          index,
                        });

                        canvas.add(img);
                      },
                      { crossOrigin: "anonymous" } // Add crossOrigin to handle CORS if needed
                    );
                  }
                })
                .catch((error) => {
                  console.error("Error converting to base64:", error);
                });
            }
          );
        }

        canvas.renderAll();

        canvasRefs.current[`${part}`] = canvas;
      });

      setTimeout(() => {
        scene.children.forEach((child) => {
          if (child instanceof THREE.Group) {
            child.children.forEach((meshh) => {
              if (Object.keys(canvasRefs.current).includes(meshh.name)) {
                mesh.current = meshh;
                const canvas = canvasRefs.current[meshh.name];

                canvas._objects.sort((a, b) => a.index - b.index);
                canvas.renderAll();
                console.log(canvas._objects);

                try {
                  const newTexture = new THREE.CanvasTexture(
                    canvasRefs.current[meshh.name].lowerCanvasEl
                  );

                  newTexture.flipY = false;
                  mesh.current.material.map = newTexture;
                  mesh.current.material.map.needsUpdate = true;
                } catch (error) {
                  console.error("Error creating texture:", error);
                }
              }
            });
          }
        });

        animate();
      }, 1000);
    };

    initializeCanvas();
    //const scene = new THREE.Scene();

    /* const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    camera.position.y = -5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf4f4f4);
    renderer.setPixelRatio(2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xf4f4f4, 1.5);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(90, 45, -45);
    directionalLight2.position.set(-45, 90, 90);
    directionalLight.castShadow = true;
    directionalLight2.castShadow = true;

    scene.add(directionalLight);
    scene.add(directionalLight2);

    containerRef.current.appendChild(renderer.domElement);

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.161;
    orbit.screenSpacePanning = false;
    orbit.maxPolarAngle = Math.PI / 1.61;
    orbit.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null,
    };
    orbit.enabled = true;
    orbit.minDistance = 16.1;
    orbit.maxDistance = 35;*/

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      orbit.update();
    };

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.domElement.remove();
      renderer.dispose();
    };
  }, [params]);

  return (
    <>
      <div ref={containerRef}></div>

      <button className={styles.copiaTextMain}>
        <NextImage src={copyIcon} width={17} height={17} />
        <p className={styles.copiaText} style={{ zIndex: "1000" }}>
          Copia o link para poderes partilhar a tua obra!
        </p>
      </button>
      <div className={styles.poweredTextMain}>
        <p className={styles.poweredText}>Powered by</p>
        <NextImage
          className={styles.poweredLogo}
          src={logoStep}
          width={105}
          height={45}
        />
      </div>
    </>
  );
};

export default Visualize;
