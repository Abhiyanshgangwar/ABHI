/**
 * Interactive 3D Background with Three.js
 * Featuring dynamic particle field, floating wireframe geometries, and mouse/scroll parallax.
 */

(function () {
  const container = document.getElementById('canvas3d-container');
  if (!container) return;

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    renderCanvasFallback(container);
    return;
  }

  try {
    initThreeScene(container);
  } catch (err) {
    console.warn("Three.js init failed, falling back to 2D canvas:", err);
    renderCanvasFallback(container);
  }

  function initThreeScene(container) {
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Floating 3D Geometries Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Hero Wireframe Icosahedron
    const icosaGeo = new THREE.IcosahedronGeometry(7, 1);
    const icosaMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2,
      metalness: 0.8
    });
    const icosahedron = new THREE.Mesh(icosaGeo, icosaMat);
    icosahedron.position.set(12, 2, -5);
    group.add(icosahedron);

    // 2. Torus Knot wireframe
    const torusGeo = new THREE.TorusKnotGeometry(4.5, 1.2, 100, 16);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x7000ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      roughness: 0.3,
      metalness: 0.7
    });
    const torusKnot = new THREE.Mesh(torusGeo, torusMat);
    torusKnot.position.set(-14, -8, -10);
    group.add(torusKnot);

    // 3. Octahedron wireframe
    const octaGeo = new THREE.OctahedronGeometry(5, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x4facfe,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
      roughness: 0.2
    });
    const octahedron = new THREE.Mesh(octaGeo, octaMat);
    octahedron.position.set(-10, 10, -8);
    group.add(octahedron);

    // 4. Subtle Dodecahedron for depth
    const dodecaGeo = new THREE.DodecahedronGeometry(3.5, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0x00e1d9,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const dodecahedron = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecahedron.position.set(14, -12, -4);
    group.add(dodecahedron);

    // 5. Star / Particle constellation field
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f2fe);
    const color2 = new THREE.Color(0x7000ff);
    const color3 = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * 120;
      positions[idx + 1] = (Math.random() - 0.5) * 120;
      positions[idx + 2] = (Math.random() - 0.5) * 80;

      const mixedColor = i % 3 === 0 ? color1 : (i % 3 === 1 ? color2 : color3);
      colors[idx] = mixedColor.r;
      colors[idx + 1] = mixedColor.g;
      colors[idx + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture or custom circular point
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2fe, 2.5, 60);
    pointLight1.position.set(10, 15, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7000ff, 2.5, 60);
    pointLight2.position.set(-15, -15, 15);
    scene.add(pointLight2);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    window.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.015;
      mouseY = (event.clientY - windowHalfY) * 0.015;
    });

    // Scroll Interaction
    let scrollY = 0;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || window.pageYOffset;
    });

    // Handle Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate geometries with varying speeds
      icosahedron.rotation.x = elapsedTime * 0.25;
      icosahedron.rotation.y = elapsedTime * 0.35;

      torusKnot.rotation.x = elapsedTime * 0.18;
      torusKnot.rotation.y = elapsedTime * 0.22;
      torusKnot.rotation.z = elapsedTime * 0.1;

      octahedron.rotation.x = elapsedTime * 0.3;
      octahedron.rotation.z = elapsedTime * 0.2;

      dodecahedron.rotation.y = elapsedTime * 0.28;
      dodecahedron.rotation.x = elapsedTime * 0.15;

      // Slowly drift particle field
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      // Parallax effect on entire group & camera
      group.position.x = targetX * 1.5;
      group.position.y = -targetY * 1.5;

      // Scroll effect: move camera slightly and rotate objects
      const scrollOffset = scrollY * 0.008;
      camera.position.y = -scrollOffset * 2;
      group.rotation.z = scrollOffset * 0.5;

      renderer.render(scene, camera);
    }

    animate();
  }

  // 2D Canvas Fallback in case WebGL or Three.js fails to load
  function renderCanvasFallback(container) {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: Math.random() > 0.5 ? '#00f2fe' : '#7000ff'
    }));

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw star lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 242, 254, ${1 - dist / 120})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw stars
      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }
})();
