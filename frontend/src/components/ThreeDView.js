import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getContainers, getItems } from '../services/api';

const ThreeDView = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, controls;
    
    const init = async () => {
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      // Create camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // Create renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Add orbit controls
      controls = new OrbitControls(camera, renderer.domElement);

      // Fetch containers and items
      const containersResponse = await getContainers();
      const itemsResponse = await getItems();

      if (containersResponse.success && itemsResponse.success) {
        const containers = containersResponse.containers;
        const items = itemsResponse.items;

        // Create container meshes
        containers.forEach(container => {
          const geometry = new THREE.BoxGeometry(container.width / 100, container.height / 100, container.depth / 100);
          const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5, wireframe: true });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(container.position.x / 100, container.position.y / 100, container.position.z / 100);
          scene.add(mesh);
        });

        // Create item meshes
        items.forEach(item => {
          if (item.position) {
            const geometry = new THREE.BoxGeometry(item.width / 100, item.height / 100, item.depth / 100);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              (item.position.startCoordinates.width + item.width / 2) / 100,
              (item.position.startCoordinates.height + item.height / 2) / 100,
              (item.position.startCoordinates.depth + item.depth / 2) / 100
            );
            scene.add(mesh);
          }
        });
      }

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    // Clean up
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeDView;
