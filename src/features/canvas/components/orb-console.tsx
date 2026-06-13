"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface OrbNodeDot {
  id: string;
  x: number;
  y: number;
  title: string;
}

interface OrbConsoleProps {
  /** Accent hex — sphere, dots and glow derive from it. */
  accent: string;
  /** Current nodespace nodes, mapped to dots on the sphere. */
  nodes: OrbNodeDot[];
  /** Assistant is streaming — the orb pulses / fires harder. */
  active?: boolean;
  /** Click a node-dot → fly the camera to that node. */
  onNavigate: (id: string) => void;
  /** Click the orb body (not a dot) → toggle the chatbot. */
  onToggleChat: () => void;
}

const R = 5;

interface MappedDot {
  id: string;
  title: string;
  pos: THREE.Vector3;
}

/** Project graph (x,y) onto the sphere surface as lon/lat (poles avoided). */
function mapNodesToSphere(nodes: OrbNodeDot[]): MappedDot[] {
  if (nodes.length === 0) return [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
  }
  const sx = maxX - minX || 1;
  const sy = maxY - minY || 1;
  return nodes.map((n) => {
    const u = (n.x - minX) / sx;
    const v = (n.y - minY) / sy;
    const lon = (u * 2 - 1) * Math.PI;
    const lat = (v - 0.5) * Math.PI * 0.9;
    const cosLat = Math.cos(lat);
    return {
      id: n.id,
      title: n.title,
      pos: new THREE.Vector3(
        R * cosLat * Math.sin(lon),
        R * Math.sin(lat),
        R * cosLat * Math.cos(lon),
      ),
    };
  });
}

/**
 * Bottom-right "console" orb: a compact, interactive neural sphere that doubles
 * as (a) the AI presence — pulses while the assistant streams — and (b) a graph
 * navigator: every node is a dot you can click to fly the camera there. Clicking
 * empty orb body opens the chat. Static single frame under reduced motion.
 */
export default function OrbConsole({ accent, nodes, active, onNavigate, onToggleChat }: OrbConsoleProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Live values read inside the rAF loop / handlers without re-mounting.
  const accentRef = useRef(accent); accentRef.current = accent;
  const activeRef = useRef(active); activeRef.current = active;
  const onNavRef = useRef(onNavigate); onNavRef.current = onNavigate;
  const onChatRef = useRef(onToggleChat); onChatRef.current = onToggleChat;

  // Bridges from the nodes-effect into the scene built by the mount-effect.
  const rebuildDotsRef = useRef<((nodes: OrbNodeDot[]) => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    mount.appendChild(renderer.domElement);

    const baseColor = new THREE.Color(accentRef.current);

    // Rotating group holds the wireframe + dots so picking respects spin.
    const group = new THREE.Group();
    scene.add(group);

    const wireMat = new THREE.MeshBasicMaterial({
      color: baseColor, wireframe: true, transparent: true, opacity: 0.16, depthWrite: false,
    });
    const wire = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 24), wireMat);
    group.add(wire);

    // Atmosphere glow shell.
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 c; uniform float s; varying vec3 vN; void main(){ float i = pow(0.6 - dot(vN, vec3(0.0,0.0,1.0)), 2.0); gl_FragColor = vec4(c,1.0)*i*s; }`,
      blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false,
      uniforms: { c: { value: baseColor.clone() }, s: { value: 0.6 } },
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.22, 24, 24), atmoMat);
    scene.add(atmo);

    // Synapse arcs — quiet at rest, busier while the AI works.
    const arcMats: THREE.LineBasicMaterial[] = [];
    const arcGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const a = new THREE.Vector3().setFromSphericalCoords(R, Math.random() * Math.PI, Math.random() * Math.PI * 2);
      const b = new THREE.Vector3().setFromSphericalCoords(R, Math.random() * Math.PI, Math.random() * Math.PI * 2);
      const mid = a.clone().add(b).multiplyScalar(0.5).setLength(R * 1.2);
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(20);
      const mat = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      arcMats.push(mat);
      arcGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    group.add(arcGroup);

    // ── Node dots (rebuildable) ──
    const dotGroup = new THREE.Group();
    group.add(dotGroup);
    const dotGeo = new THREE.SphereGeometry(0.16, 8, 8);

    const rebuildDots = (ns: OrbNodeDot[]) => {
      for (let i = dotGroup.children.length - 1; i >= 0; i--) {
        const c = dotGroup.children[i] as THREE.Mesh;
        (c.material as THREE.Material).dispose();
        dotGroup.remove(c);
      }
      for (const m of mapNodesToSphere(ns)) {
        const mat = new THREE.MeshBasicMaterial({ color: accentRef.current });
        const mesh = new THREE.Mesh(dotGeo, mat);
        mesh.position.copy(m.pos).multiplyScalar(1.03);
        mesh.userData = { id: m.id, title: m.title };
        dotGroup.add(mesh);
      }
    };
    rebuildDots(nodes);
    rebuildDotsRef.current = rebuildDots;

    // ── Picking ──
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0, downY = 0;

    const toNdc = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const onDown = (e: PointerEvent) => { downX = e.clientX; downY = e.clientY; };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return; // drag, not click
      toNdc(e);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(dotGroup.children, false)[0];
      if (hit) {
        const id = (hit.object.userData as { id?: string }).id;
        if (id) onNavRef.current(id);
      } else {
        onChatRef.current();
      }
    };
    // Hover affordance: pointer cursor over a dot, show its title.
    const onMove = (e: PointerEvent) => {
      toNdc(e);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(dotGroup.children, false)[0];
      const title = hit ? (hit.object.userData as { title?: string }).title : undefined;
      renderer.domElement.style.cursor = "pointer";
      renderer.domElement.title = title || "Open assistant";
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);

    // ── Runtime ──
    const currentColor = baseColor.clone();
    const targetColor = new THREE.Color();
    let hidden = document.hidden;
    let animationId = 0;
    let lastTime = 0;
    let elapsed = 0;

    const renderFrame = () => {
      const now = performance.now();
      const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;
      elapsed += dt;

      const boost = activeRef.current ? 1 : 0;

      targetColor.set(accentRef.current);
      currentColor.lerp(targetColor, Math.min(1, dt * 3));
      wireMat.color.copy(currentColor);
      (atmoMat.uniforms.c.value as THREE.Color).copy(currentColor);
      atmoMat.uniforms.s.value = 0.5 + boost * 0.5 + Math.sin(elapsed * 2) * 0.05 * (0.4 + boost);

      group.rotation.y += dt * (0.12 + boost * 0.25);

      for (let i = 0; i < arcMats.length; i++) {
        const wave = Math.sin(elapsed * (0.8 + i * 0.18) + i);
        const fired = Math.max(0, wave) ** 3;
        arcMats[i].color.copy(currentColor);
        arcMats[i].opacity = fired * (0.25 + boost * 0.65);
      }

      renderer.render(scene, camera);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (hidden) return;
      renderFrame();
    };
    const startOrStill = () => {
      cancelAnimationFrame(animationId);
      if (reducedMotionMq.matches) renderFrame();
      else { lastTime = 0; animate(); }
    };
    startOrStill();

    const onVisibility = () => { hidden = document.hidden; if (!hidden) lastTime = 0; };
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotionMq.addEventListener("change", startOrStill);

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = Math.max(mount.clientHeight, 1);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reducedMotionMq.matches) renderFrame();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotionMq.removeEventListener("change", startOrStill);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      rebuildDotsRef.current = null;
      wire.geometry.dispose(); wireMat.dispose();
      atmo.geometry.dispose(); atmoMat.dispose();
      dotGeo.dispose();
      for (const c of dotGroup.children) (c as THREE.Mesh).material && ((c as THREE.Mesh).material as THREE.Material).dispose();
      arcGroup.children.forEach((l) => (l as THREE.Line).geometry.dispose());
      arcMats.forEach((m) => m.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // Mount once; live data flows through refs + the nodes effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild dots whenever the node set/positions change.
  useEffect(() => {
    rebuildDotsRef.current?.(nodes);
  }, [nodes]);

  return <div ref={mountRef} className="orb-console" aria-label="Assistant & graph navigator" role="button" tabIndex={0} />;
}
