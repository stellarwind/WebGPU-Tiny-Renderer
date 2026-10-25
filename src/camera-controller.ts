import type { Mat4 } from "wgpu-matrix";

export interface CameraController {
    update(deltaTime: number): Mat4;
}
