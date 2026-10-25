import { Mat4, mat4 } from "wgpu-matrix";
import { defaultSettings } from "./settings";
import { Entity } from "./entity";
import type { CameraController } from "./camera-controller";

export class Camera extends Entity {
    private fov: number = (60 * Math.PI) / 180;

    public set setFOV(value: number) {
        this.fov = (value * Math.PI) / 180;
    }

    private aspect = defaultSettings.resolution.width / defaultSettings.resolution.height;

    private near = 0.1;

    public set setNear(value: number) {
        this.near = Math.max(0.001, value);
    }

    private far = 10000.0;

    public set setFar(value: number) {
        this.far = Math.max(this.near + 0.001, value);
    }

    private projectionMatrix = mat4.perspective(this.fov, this.aspect, this.near, this.far); // Actually [-zNear -> -zFar]

    private controller: CameraController | null = null;
    private viewMatrix = mat4.identity();

    public attachController(controller: CameraController | null) {
        this.controller = controller;
    }

    public update(deltaTime: number) {
        if (this.controller) {
            this.transform.setModelMatrix(this.controller.update(deltaTime));
        }
        mat4.invert(this.transform.modelMatrix, this.viewMatrix);
    }

    public get matrices(): [Mat4, Mat4] {
        return [this.projectionMatrix, this.viewMatrix];
    }

    public get shaderData(): Float32Array {
        const modelMatrix = this.transform.modelMatrix;
        return new Float32Array([
            -modelMatrix[8], -modelMatrix[9], -modelMatrix[10], 0,
            modelMatrix[12], modelMatrix[13], modelMatrix[14], 0]);
    }
}
