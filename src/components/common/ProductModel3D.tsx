/* ============================================================
   UNIFORGE — PRODUCT MODEL 3D
   A parametric Three.js brass coupling (VND-992-B) staged on a
   blueprint plinth. This component owns the scene, lighting,
   orbit controls and render loop; attribute callouts live in
   the parent as HTML so they stay crisp at any scale.

   Imported lazily by the landing dialog so `three` never enters
   the main application chunk.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface ProductModel3DProps {
  className?: string;
  /** Rendered when WebGL is unavailable or the renderer fails to start. */
  fallback?: React.ReactNode;
}

export function ProductModel3D({ className = "", fallback }: ProductModel3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || failed) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(3.5, 2.4, 4.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.55;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 1.1;
    controls.target.set(0, 0.05, 0);

    /* ---- lights: warm industrial key + cyan engineering rim ---- */
    scene.add(new THREE.HemisphereLight(0x93a7b8, 0x0c0e10, 0.5));

    const key = new THREE.DirectionalLight(0xfff1d8, 1.35);
    key.position.set(3.2, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.camera.left = -3.5;
    key.shadow.camera.right = 3.5;
    key.shadow.camera.top = 3.5;
    key.shadow.camera.bottom = -3.5;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x37c7ea, 1.1);
    rim.position.set(-4.2, 1.6, -3.2);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffc78a, 0.35);
    fill.position.set(0.5, -1.4, -3.6);
    scene.add(fill);

    /* ---- materials ---- */
    const brass = new THREE.MeshStandardMaterial({
      color: 0xb08d57,
      metalness: 0.82,
      roughness: 0.34,
    });
    const brassGroove = new THREE.MeshStandardMaterial({
      color: 0x8a6d3f,
      metalness: 0.9,
      roughness: 0.45,
    });
    const bore = new THREE.MeshStandardMaterial({
      color: 0x140f08,
      metalness: 0.6,
      roughness: 0.85,
    });
    const seal = new THREE.MeshStandardMaterial({
      color: 0x37c7ea,
      emissive: 0x37c7ea,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.2,
    });

    /* ---- coupling assembly (axis = X) ---- */
    const coupling = new THREE.Group();

    const add = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      x: number,
      y = 0,
      z = 0,
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      coupling.add(mesh);
      return mesh;
    };

    // threaded barrels
    const barrelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.62, 40).rotateZ(
      Math.PI / 2,
    );
    add(barrelGeo, brass, -0.76);
    add(barrelGeo, brass, 0.76);

    const ringGeo = new THREE.CylinderGeometry(0.335, 0.335, 0.032, 36).rotateZ(
      Math.PI / 2,
    );
    for (let i = 0; i < 9; i++) {
      const x = 0.47 + i * 0.064;
      add(ringGeo, brassGroove, -x);
      add(ringGeo, brassGroove, x);
    }

    // central hex nut with a flat face up
    const nutGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.46, 6)
      .rotateZ(Math.PI / 2)
      .rotateX(Math.PI / 6);
    add(nutGeo, brass, 0);

    // shoulders + end caps
    const shoulderGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.05, 36).rotateZ(
      Math.PI / 2,
    );
    add(shoulderGeo, brass, -0.27);
    add(shoulderGeo, brass, 0.27);

    const capGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.07, 40).rotateZ(
      Math.PI / 2,
    );
    add(capGeo, brass, -1.11);
    add(capGeo, brass, 1.11);

    // through-bore
    add(new THREE.CylinderGeometry(0.11, 0.11, 2.5, 24).rotateZ(Math.PI / 2), bore, 0);

    // verified seal ring around the nut
    const sealGeo = new THREE.TorusGeometry(0.56, 0.014, 12, 72).rotateY(
      Math.PI / 2,
    );
    const sealRing = add(sealGeo, seal, 0);
    sealRing.castShadow = false;

    coupling.rotation.x = 0.06;
    coupling.position.y = 0.38;
    scene.add(coupling);

    /* ---- blueprint plinth ---- */
    const shadowGeo = new THREE.CircleGeometry(1.85, 64);
    shadowGeo.rotateX(-Math.PI / 2);
    const plinth = new THREE.Mesh(
      shadowGeo,
      new THREE.ShadowMaterial({ opacity: 0.34 }),
    );
    plinth.position.y = -0.5;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const grid = new THREE.GridHelper(4.6, 22, 0x2e4a5c, 0x18232d);
    grid.position.y = -0.49;
    const gridMaterial = grid.material as THREE.Material | THREE.Material[];
    if (Array.isArray(gridMaterial)) {
      gridMaterial.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.55;
      });
    }
    scene.add(grid);

    const plinthRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.85, 0.01, 8, 80).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0x37c7ea,
        transparent: true,
        opacity: 0.5,
      }),
    );
    plinthRing.position.y = -0.485;
    scene.add(plinthRing);

    /* ---- resize ---- */
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    /* ---- render loop ---- */
    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      const t = clock.getElapsedTime();
      if (!reduced) {
        coupling.position.y = 0.38 + Math.sin(t * 0.8) * 0.028;
        seal.emissiveIntensity = 0.5 + 0.22 * Math.sin(t * 1.5);
      }
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [failed]);

  if (failed) return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Interactive 3D model of the VND-992-B brass coupling — drag to rotate"
    />
  );
}
