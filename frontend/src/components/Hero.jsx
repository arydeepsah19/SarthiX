import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Truck, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const truckModel = new URL("../assets/truck-compressed.glb", import.meta.url).href;

export default function HeroSection() {
  const mountRef   = useRef(null);
  const [loaded,   setLoaded]   = useState(false);
  const [loadPct,  setLoadPct]  = useState(0);
  const navigate   = useNavigate();

  const stats = [
    { icon: Truck,    label: "Active Shipments", value: "12K+" },
    { icon: Shield,   label: "Permits Monitored", value: "8K+"  },
    { icon: BarChart3, label: "Bids Processed",  value: "50K+" },
  ];

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 200);
    camera.position.set(4, 2, 7);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableZoom     = true;
    controls.minDistance    = 2;
    controls.maxDistance    = 18;
    controls.maxPolarAngle  = Math.PI / 1.9;
    controls.minPolarAngle  = Math.PI / 8;
    controls.target.set(0, 1, 0);

    let autoTimer;
    const onStart = () => { controls.autoRotate = false; clearTimeout(autoTimer); };
    const onEnd   = () => { autoTimer = setTimeout(() => { controls.autoRotate = true; }, 3000); };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end",   onEnd);

    scene.add(new THREE.AmbientLight(0xfff5ee, 1.1));
    const sun  = new THREE.DirectionalLight(0xfff0e0, 3.5);
    sun.position.set(-5, 8, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { near: 0.5, far: 40, left: -8, right: 8, top: 8, bottom: -8 });
    sun.shadow.bias = -0.001; scene.add(sun);
    const fill = new THREE.DirectionalLight(0x6699ff, 1.0); fill.position.set(6, 3, -4); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0xf97316, 1.6); rim.position.set(-2, -1, -6); scene.add(rim);
    scene.add(new THREE.DirectionalLight(0xffeedd, 0.4));

    const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 }));
    groundMesh.rotation.x = -Math.PI / 2; groundMesh.receiveShadow = true; scene.add(groundMesh);

    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
    );
    glowPlane.rotation.x = -Math.PI / 2; glowPlane.position.y = 0.01; scene.add(glowPlane);

    const rings = [];
    [3.2, 4.0, 5.0].forEach((r, i) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.012, 8, 100),
        new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
      );
      mesh.rotation.x = Math.PI / 2 + i * 0.3;
      mesh.rotation.z = i * 0.5;
      scene.add(mesh);
      rings.push({ mesh, speed: 0.004 + i * 0.002, axis: new THREE.Vector3(0.15 * i, 1, 0.08 * i).normalize() });
    });

    const pCount = 400, pGeo = new THREE.BufferGeometry(), pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xf97316, size: 0.05, transparent: true, opacity: 0.4 }));
    scene.add(pts);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let truck = null, floatT = 0;
    loader.load(truckModel, (gltf) => {
      truck = gltf.scene;
      const box3 = new THREE.Box3().setFromObject(truck);
      const size = box3.getSize(new THREE.Vector3()), center = box3.getCenter(new THREE.Vector3());
      const scale = 3.5 / Math.max(size.x, size.y, size.z);
      truck.scale.setScalar(scale);
      truck.position.set(-center.x * scale, -box3.min.y * scale, -center.z * scale);
      truck.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; if (c.material) c.material.envMapIntensity = 1.2; } });
      scene.add(truck);
      controls.target.set(0, (size.y * scale) / 2.5, 0);
      controls.update(); setLoaded(true); window.dispatchEvent(new Event("resize"));
    }, (xhr) => { if (xhr.lengthComputable) setLoadPct(Math.round(xhr.loaded / xhr.total * 100)); },
      (err) => console.error("GLB load error:", err));

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (truck) { floatT += 0.016; truck.position.y = Math.sin(floatT * 0.7) * 0.06; }
      rings.forEach(({ mesh, speed, axis }) => { mesh.rotateOnAxis(axis, speed); mesh.material.opacity = 0.08 + Math.sin(t * 0.6) * 0.05; });
      pts.rotation.y = t * 0.03;
      glowPlane.material.opacity = 0.04 + Math.sin(t * 1.2) * 0.02;
      controls.update(); renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf); clearTimeout(autoTimer);
      controls.removeEventListener("start", onStart); controls.removeEventListener("end", onEnd);
      controls.dispose(); window.removeEventListener("resize", onResize);
      renderer.dispose(); dracoLoader.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --orange: #f97316; --dark: #0c0c18; }
        body { background: var(--dark); }

        .hero {
          position: relative; width: 100%; min-height: 100vh;
          background: var(--dark);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: 'DM Sans', sans-serif; padding-top: 68px;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(249,115,22,0.035) 1px,transparent 1px), linear-gradient(90deg,rgba(249,115,22,0.035) 1px,transparent 1px);
          background-size: 64px 64px; pointer-events: none; z-index: 0;
        }
        .hero-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: min(1000px, 130vw); height: min(900px, 120vw);
          background: radial-gradient(ellipse, rgba(249,115,22,0.065) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .hero-container {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          align-items: center;
          min-height: calc(100vh - 68px);
          padding: 0 5vw; gap: 1rem;
        }
        .hero-text { display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem 0; }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem;
          font-size: 0.7rem; letter-spacing: 0.3em; color: var(--orange);
          font-weight: 500; text-transform: uppercase;
          animation: fadeUp 0.7s ease both;
        }
        .eyebrow::before { content:''; display:block; width:30px; height:1px; background:var(--orange); flex-shrink:0; }
        .hero-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.2rem, 5.5vw, 7rem);
          line-height: 0.92; color: #fff; letter-spacing: 0.025em;
          animation: fadeUp 0.7s 0.1s ease both;
          text-transform: lowercase;
        }
        .hero-h1::first-letter { text-transform: uppercase; }
        .gradient-text { color: var(--orange); }
        .hero-desc {
          max-width: 390px; font-size: clamp(0.85rem, 1.5vw, 0.97rem);
          line-height: 1.75; color: rgba(255,255,255,0.42); font-weight: 300;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions { display:flex; gap:0.85rem; flex-wrap:wrap; animation: fadeUp 0.7s 0.3s ease both; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.78rem 2.1rem; background: var(--orange); color: #fff; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #fb923c; transform: translateY(-2px); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.78rem 2.1rem; background: transparent; color: rgba(255,255,255,0.65);
          border: 1px solid rgba(249,115,22,0.22);
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-outline:hover { border-color: rgba(249,115,22,0.65); color: var(--orange); transform: translateY(-2px); }
        .hero-stats {
          display: flex; flex-wrap: wrap; gap: 1.5rem;
          padding-top: 1.6rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          animation: fadeUp 0.6s 0.65s ease both;
        }
        .stat-item { display: flex; align-items: center; gap: 0.75rem; }
        .stat-icon-wrap {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 0.55rem;
          background: rgba(249,115,22,0.12); flex-shrink: 0;
        }
        .stat-icon-wrap svg { color: var(--orange); }
        .stat-val { font-size: clamp(1.1rem, 2vw, 1.4rem); font-weight: 700; color: #fff; line-height: 1; }
        .stat-lbl { font-size: 0.68rem; color: rgba(255,255,255,0.45); letter-spacing: 0.03em; margin-top: 3px; }
        .badge {
          display:inline-flex; align-items:center; gap:0.4rem;
          padding:0.3rem 0.8rem; border:1px solid rgba(249,115,22,0.2);
          font-size:0.65rem; letter-spacing:0.18em; color:rgba(249,115,22,0.7);
          text-transform:uppercase; animation: fadeUp 0.7s 0.5s ease both; width:fit-content;
        }
        .badge-dot { width:5px; height:5px; border-radius:50%; background:var(--orange); animation: blink 1.4s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .canvas-wrap {
          position:relative; width:100%; height: clamp(280px, 65vh, 75vh);
          animation: fadeIn 1s 0.15s ease both;
        }
        .canvas-wrap canvas { width:100% !important; height:100% !important; cursor:grab; }
        .canvas-wrap canvas:active { cursor:grabbing; }
        .c { position:absolute; width:24px; height:24px; border-color:rgba(249,115,22,0.35); border-style:solid; pointer-events:none; }
        .c-tl { top:6px; left:6px;   border-width:1.5px 0 0 1.5px; }
        .c-tr { top:6px; right:6px;  border-width:1.5px 1.5px 0 0; }
        .c-bl { bottom:6px; left:6px;  border-width:0 0 1.5px 1.5px; }
        .c-br { bottom:6px; right:6px; border-width:0 1.5px 1.5px 0; }
        .drag-hint {
          position:absolute; bottom:18px; left:50%; transform:translateX(-50%);
          display:flex; align-items:center; gap:0.5rem;
          font-size:0.68rem; letter-spacing:0.22em; color:rgba(249,115,22,0.55);
          text-transform:uppercase; pointer-events:none; white-space:nowrap;
          animation: pulse 2.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .loading-overlay {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:1.2rem;
          background:rgba(12,12,24,0.85); z-index:10; transition:opacity 0.6s;
        }
        .loading-overlay.hidden { opacity:0; pointer-events:none; }
        .loader-ring { width:52px; height:52px; border:2px solid rgba(249,115,22,0.15); border-top-color:var(--orange); border-radius:50%; animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .loader-pct { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:var(--orange); letter-spacing:0.15em; }
        .loader-label { font-size:0.65rem; letter-spacing:0.3em; color:rgba(255,255,255,0.3); text-transform:uppercase; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero-container {
            grid-template-columns: 1fr;
            padding: 2.5rem 6vw 3rem;
            text-align: center;
            gap: 2.5rem;
          }
          .eyebrow, .hero-actions, .badge { justify-content: center; }
          .hero-desc { max-width: 100%; }
          .hero-stats { justify-content: center; gap: 1.2rem; }
          .canvas-wrap { height: clamp(240px, 55vw, 400px); order: -1; }
          .hero-h1 { font-size: clamp(2.8rem, 9vw, 4.5rem); }
        }
        @media (max-width: 480px) {
          .hero { padding-top: 60px; }
          .hero-container { padding: 1.5rem 5vw 2rem; gap: 1.5rem; }
          .hero-h1 { font-size: clamp(2.4rem, 12vw, 3.2rem); }
          .btn-primary, .btn-outline { padding: 0.65rem 1.4rem; font-size: 0.74rem; width: 100%; justify-content: center; }
          .stat-item { flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
          .stat-icon-wrap { width: 34px; height: 34px; }
          .canvas-wrap { height: clamp(200px, 60vw, 320px); }
        }
      `}</style>

      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-container">
          {/* LEFT */}
          <div className="hero-text">
            <div className="badge"><div className="badge-dot" /><span>Now in Beta</span></div>

            <h1 className="hero-h1">
              Logistics, <span className="gradient-text">reimagined</span><br />
              through transparency.
            </h1>

            <p className="hero-desc">
              Sarthix connects drivers and shippers through real-time bidding,
              shipment tracking, and automated permit compliance — all in one platform.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate("/login")}>
                Get Started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button className="btn-outline" onClick={() => { const el = document.getElementById("how-it-works"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>
                See How It Works
              </button>
            </div>

            <div className="hero-stats">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="stat-item">
                    <div className="stat-icon-wrap"><Icon size={18} /></div>
                    <div>
                      <div className="stat-val">{stat.value}</div>
                      <div className="stat-lbl">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 3D */}
          <div className="canvas-wrap">
            <div className="c c-tl" /><div className="c c-tr" />
            <div className="c c-bl" /><div className="c c-br" />
            <div className={`loading-overlay${loaded ? " hidden" : ""}`}>
              <div className="loader-ring" />
              <div className="loader-pct">{loadPct}%</div>
              <div className="loader-label">Loading model</div>
            </div>
            <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
            {loaded && (
              <div className="drag-hint">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3"/></svg>
                Drag · Scroll to zoom
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}