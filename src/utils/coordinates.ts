import { Point, Camera } from '../types/canvas';
import { MIN_ZOOM, MAX_ZOOM } from '../constants/canvas';

/**
 * Converts screen pixel coordinates to infinite world coordinates.
 */
export function screenToWorld(screenPoint: Point, camera: Camera): Point {
  return {
    x: (screenPoint.x - camera.x) / camera.zoom,
    y: (screenPoint.y - camera.y) / camera.zoom
  };
}

/**
 * Converts infinite world coordinates to screen pixel coordinates.
 */
export function worldToScreen(worldPoint: Point, camera: Camera): Point {
  return {
    x: worldPoint.x * camera.zoom + camera.x,
    y: worldPoint.y * camera.zoom + camera.y
  };
}

/**
 * Computes updated camera coordinates centered around the mouse cursor when zooming.
 */
export function zoomAroundPoint(
  cursorScreen: Point,
  camera: Camera,
  deltaZoom: number
): Camera {
  const newZoom = Math.min(Math.max(camera.zoom + deltaZoom, MIN_ZOOM), MAX_ZOOM);
  if (newZoom === camera.zoom) return camera;

  // Preserve the world point directly under the mouse cursor
  const worldUnderCursor = screenToWorld(cursorScreen, camera);
  const newCameraX = cursorScreen.x - worldUnderCursor.x * newZoom;
  const newCameraY = cursorScreen.y - worldUnderCursor.y * newZoom;

  return {
    x: newCameraX,
    y: newCameraY,
    zoom: newZoom
  };
}
