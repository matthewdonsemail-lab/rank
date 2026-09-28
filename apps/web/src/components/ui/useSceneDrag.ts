import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointerClaimed } from "./SceneTuner";

/**
 * Picking objects in a scene up with the pointer and putting them down again.
 *
 * Shared, because the same ninety lines were otherwise needed by everything in a
 * scene a visitor can touch, and because two copies listening on the same canvas
 * is how a drag ends up moving two things at once. Only one object is held at a
 * time across the whole page, and a pointerdown that hits nothing falls through
 * to whatever else is listening — the camera tuner, in practice.
 *
 * The pick is a real raycast, so it works anywhere on the object rather than only
 * near its centre. The drag then moves it along the plane it was grabbed on,
 * parallel to the screen, which is what makes it feel like the cursor has hold of
 * the thing rather than the thing sliding along a line in space.
 */

export interface DragRecord {
  /** The animated transform. Everything under it is the model. */
  group: THREE.Object3D;
  /** Where it is in the room. Written by the drag, and by whatever owns it. */
  position: THREE.Vector3;
}

export interface DragMove {
  record: DragRecord;
  /** How far it moved this event, in world units per second. */
  velocity: THREE.Vector3;
  /** True on the event that let go of it. */
  released: boolean;
  /** World-space grab point, present on the latch event only. */
  point?: THREE.Vector3;
}

const scratchNdc = new THREE.Vector2();
const scratchRay = new THREE.Raycaster();
const scratchPlane = new THREE.Plane();
const scratchPoint = new THREE.Vector3();
const scratchForward = new THREE.Vector3();
const scratchDelta = new THREE.Vector3();

/** The one object being carried, page-wide. */
let held: DragRecord | null = null;

export function useSceneDrag(records: DragRecord[], onMove?: (move: DragMove) => void) {
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  // Latest callback and latest list, so neither is a reason to rebind the
  // listeners on every frame.
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const recordsRef = useRef(records);
  recordsRef.current = records;
  const activeRef = useRef(false);
  // When the pointer last moved, so the velocity handed to the caller is per
  // second rather than per event.
  const movedAt = useRef(0);

  useEffect(() => {
    const toNdc = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      scratchNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      return true;
    };

    /** Walks up from whatever was hit to the record that owns it. */
    const ownerOf = (object: THREE.Object3D): DragRecord | null => {
      let node: THREE.Object3D | null = object;
      while (node) {
        const found = recordsRef.current.find((record) => record.group === node);
        if (found) return found;
        node = node.parent;
      }
      return null;
    };

    const down = (event: PointerEvent) => {
      if (event.button !== 0 || held || !toNdc(event)) return;
      scratchRay.setFromCamera(scratchNdc, camera);
      const hits = scratchRay.intersectObjects(
        recordsRef.current.map((record) => record.group),
        true,
      );
      for (const hit of hits) {
        const record = ownerOf(hit.object);
        if (!record) continue;
        held = record;
        activeRef.current = true;
        // The drag plane faces the camera and passes through the grab point, so
        // moving the cursor moves the object across the screen and no further.
        camera.getWorldDirection(scratchForward);
        scratchPlane.setFromNormalAndCoplanarPoint(scratchForward, hit.point);
        // The camera tuner listens on the same element; this says the pointer
        // belongs to the object, so the drag does not move the camera as well.
        pointerClaimed.value = true;
        canvas.dataset.cursor = "grabbing";
        canvas.setPointerCapture(event.pointerId);
        movedAt.current = performance.now();
        // Report the latch with zero velocity and the grab point, so the owner
        // can anchor anything hanging off the object to where it was taken.
        onMoveRef.current?.({ record, velocity: scratchDelta.set(0, 0, 0), released: false, point: hit.point.clone() });
        return;
      }
    };

    const move = (event: PointerEvent) => {
      const record = held;
      if (!record || !activeRef.current || !toNdc(event)) return;
      scratchRay.setFromCamera(scratchNdc, camera);
      camera.getWorldDirection(scratchForward);
      scratchPlane.setFromNormalAndCoplanarPoint(scratchForward, scratchPoint.copy(record.position));
      if (!scratchRay.ray.intersectPlane(scratchPlane, scratchPoint)) return;
      // Velocity is the movement actually made, over the time actually taken —
      // otherwise a throw is framerate dependent, and the same flick on a fast
      // machine throws half as far as on a slow one. Floored, because two
      // pointermove events in the same millisecond would otherwise divide by
      // almost nothing and hand back a speed of thousands.
      const now = performance.now();
      const elapsed = Math.max(now - movedAt.current, 8) / 1000;
      movedAt.current = now;
      scratchDelta.copy(scratchPoint).sub(record.position).divideScalar(elapsed);
      record.position.copy(scratchPoint);
      onMoveRef.current?.({ record, velocity: scratchDelta, released: false });
    };

    const up = (event: PointerEvent) => {
      const record = held;
      if (!record || !activeRef.current) return;
      held = null;
      activeRef.current = false;
      pointerClaimed.value = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      delete canvas.dataset.cursor;
      onMoveRef.current?.({ record, velocity: scratchDelta, released: true });
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [canvas, camera]);

  // A hook that unmounts mid-drag must not leave the pointer claimed.
  useEffect(
    () => () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      held = null;
      pointerClaimed.value = false;
    },
    [],
  );
}
