import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/web';
import BackgroundCarousel from './BackgroundCarousel';
import { Book } from 'lucide-react';

const HeroSection: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Spring animations for content
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
  });
  
  const buttonSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 600,
  });
  
  const cardsSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 800,
  });
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Create a simple building model
    const buildingGroup = new THREE.Group();
    
    // Main building body
    const buildingGeometry = new THREE.BoxGeometry(3, 2, 1.5);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      metalness: 0.2,
      roughness: 0.5,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingGroup.add(building);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(2.2, 1, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.5;
    roof.rotation.y = Math.PI / 4;
    buildingGroup.add(roof);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdbeafe,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.3,
    });
    
    // Front windows
    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const windowGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(
        -0.8 + col * 0.8, 
        0 - row * 0.8, 
        0.8
      );
      buildingGroup.add(windowMesh);
    }
    
    // Add entrance
    const doorGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x1e40af });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, -0.6, 0.8);
    buildingGroup.add(door);
    
    // Add steps
    const stepsGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
    const stepsMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const steps = new THREE.Mesh(stepsGeometry, stepsMaterial);
    steps.position.set(0, -1.1, 0.9);
    buildingGroup.add(steps);
    
    // Add to scene
    scene.add(buildingGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Camera position
    camera.position.z = 5;
    camera.position.y = 1;
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const animate = () => {
      if (!mountRef.current) return;
      
      buildingGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative min-h-screen">
      {/* Carousel Background */}
      <BackgroundCarousel 
        externalSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      {/* 3D animation container
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.4, zIndex: 5 }}
      />
       */}
      {/* Content overlay */}
      <div className="relative z-40 pt-20 md:pt-32 flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8">
        <animated.div style={fadeIn} className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Book className="w-10 h-10 text-blue-300 mr-3 filter drop-shadow-lg" />
            <div className="bg-white/30 backdrop-blur-lg px-5 py-2 rounded-full text-white text-sm font-semibold shadow-lg">
              GNDEC Grievance Portal
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl mx-auto leading-tight mb-8 drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-50">
              GNDEC Grievance
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
              Redressal Portal
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md backdrop-blur-sm bg-black/10 p-4 rounded-lg">
            A platform where your concerns matter. Submit and track grievances with a streamlined and transparent process.
          </p>
        </animated.div>
        
        {/* Action buttons with glass effect container for better visibility */}
        <animated.div 
          style={buttonSpring} 
          className="mt-12 z-50 relative w-full px-4 sm:px-0"
        >
          <div className="backdrop-blur-xl bg-white/10 p-4 sm:p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:gap-8 md:gap-10 justify-center items-center">
              <Link 
                to="/file-grievance" 
                className="w-full sm:w-52 md:w-56 lg:w-64 px-4 sm:px-6 py-4 mb-4 sm:mb-0 rounded-lg text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-xl transform hover:translate-y-[-2px] hover:shadow-blue-500/30 text-center"
              >
                File a Grievance
              </Link>
              <Link 
                to="/track-grievance" 
                className="w-full sm:w-52 md:w-56 lg:w-64 px-4 sm:px-6 py-4 rounded-lg text-lg font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 shadow-xl transform hover:translate-y-[-2px] hover:shadow-white/30 text-center"
              >
                Track Your Grievance
              </Link>
            </div>
          </div>
        </animated.div>
        
        {/* Indicators */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center z-30">
          <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            {[0, 1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'w-8 bg-blue-500' 
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Process cards */}
      <animated.div 
        style={cardsSpring} 
        className="relative z-40 max-w-7xl mx-auto px-4 -mt-44 mb-20 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-black/40 backdrop-blur-lg p-8 rounded-xl border border-gray-700/50 shadow-2xl transform transition-transform duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-900/30">
            <span className="text-2xl font-bold text-white">1</span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3 text-center">Submit Grievance</h3>
          <p className="text-gray-200 text-center">
            Fill out the grievance form with relevant details and supporting documents.
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-lg p-8 rounded-xl border border-gray-700/50 shadow-2xl transform transition-transform duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-900/30">
            <span className="text-2xl font-bold text-white">2</span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3 text-center">Track Progress</h3>
          <p className="text-gray-200 text-center">
            Monitor the status of your grievance in real-time through your dashboard.
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-lg p-8 rounded-xl border border-gray-700/50 shadow-2xl transform transition-transform duration-300 hover:scale-105">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-900/30">
            <span className="text-2xl font-bold text-white">3</span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3 text-center">Get Resolution</h3>
          <p className="text-gray-200 text-center">
            Receive updates and resolutions directly through the portal and email.
          </p>
        </div>
      </animated.div>
      
      {/* Arrow navigation */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-between px-8 z-50">
        <button 
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600/40 to-blue-800/40 backdrop-blur-lg flex items-center justify-center hover:from-blue-600/60 hover:to-blue-800/60 transition-all duration-300 shadow-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={() => {
            // Previous slide navigation handled by the BackgroundCarousel component
            const prevSlide = currentSlide === 0 ? 4 : currentSlide - 1;
            setCurrentSlide(prevSlide);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600/40 to-blue-800/40 backdrop-blur-lg flex items-center justify-center hover:from-blue-600/60 hover:to-blue-800/60 transition-all duration-300 shadow-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={() => {
            // Next slide navigation handled by the BackgroundCarousel component
            const nextSlide = (currentSlide + 1) % 5;
            setCurrentSlide(nextSlide);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;