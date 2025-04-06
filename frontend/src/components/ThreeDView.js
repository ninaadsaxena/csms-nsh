import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getContainers, getItems } from '../services/api';

const ThreeDView = () => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let scene, camera, renderer, controls;
    const currentRef = mountRef.current;
    
    const init = async () => {
      try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e17); // Match space-black from CSS
        
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.02,
        });
        
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const y = (Math.random() - 0.5) * 2000;
          const z = (Math.random() - 0.5) * 2000;
          starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
        
        // Add ambient light with space feel
        const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
        scene.add(ambientLight);
        
        // Add directional light to simulate sun
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (currentRef) {
          currentRef.appendChild(renderer.domElement);
        }

        // Add orbit controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add smooth damping effect

        // Fetch containers and items
        const containersResponse = await getContainers();
        const itemsResponse = await getItems();

        if (containersResponse.success && itemsResponse.success) {
          const containers = containersResponse.containers || [];
          const items = itemsResponse.items || [];

          // Create container meshes
          containers.forEach(container => {
            const geometry = new THREE.BoxGeometry(container.width / 100, container.height / 100, container.depth / 100);
            const material = new THREE.MeshPhongMaterial({ 
              color: 0x1e3a8a, // Match cosmic-blue from CSS
              transparent: true, 
              opacity: 0.3, 
              wireframe: true 
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(container.position.x / 100, container.position.y / 100, container.position.z / 100);
            scene.add(mesh);
          });

          // Create item meshes with different colors based on type
          items.forEach(item => {
            if (item.position) {
              // Generate color based on item type or other properties
              let itemColor = 0x5b21b6; // Default to nebula-purple
              
              if (item.priority > 80) {
                itemColor = 0xf59e0b; // High priority items get meteor-orange
              } else if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
                itemColor = 0xef4444; // Expired items get red
              }
              
              const geometry = new THREE.BoxGeometry(item.width / 100, item.height / 100, item.depth / 100);
              const material = new THREE.MeshPhongMaterial({ 
                color: itemColor,
                shininess: 30
              });
              const mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(
                (item.position.startCoordinates.width + item.width / 2) / 100,
                (item.position.startCoordinates.height + item.height / 2) / 100,
                (item.position.startCoordinates.depth + item.depth / 2) / 100
              );
              scene.add(mesh);
            }
          });
        } else {
          throw new Error('Failed to fetch data for 3D view');
        }

        setLoading(false);

        // Handle window resize
        const handleResize = () => {
          if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        };
        
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          if (controls) controls.update();
          if (renderer && scene && camera) renderer.render(scene, camera);
        };
        animate();
        
        // Return cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (currentRef && renderer && currentRef.contains(renderer.domElement)) {
            currentRef.removeChild(renderer.domElement);
          }
          if (renderer) {
            renderer.dispose();
          }
          if (controls) {
            controls.dispose();
          }
        };
      } catch (err) {
        console.error('Error initializing 3D view:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const cleanup = init();
    
    // Clean up
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  if (loading) {
    return <div className="space-loader"></div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return <div ref={mountRef} className="three-d-container" style={{ width: '100%', height: '80vh' }} />;
};

export default ThreeDView;
