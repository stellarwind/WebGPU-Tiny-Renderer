import { Mat4, mat4, quat, utils, vec3 } from "wgpu-matrix";
import type { CameraController } from "./camera-controller";
import { Input } from "./input";
import { clamp } from "./util";

export class OrbitCameraController implements CameraController {
    private pitchAngle: number = 0;
    private yawAngle: number = 0;
    private distance: number = 6;
    private maxDist: number = 100;
    private minDist: number = 0.5;
    private zoomSpeed: number = 0.01;
    private sensitivity: number = 50;
    private readonly up = vec3.fromValues(0, 1, 0);

    constructor(private readonly input: Input) {}

    public update(deltaTime: number): Mat4 {
        this.yawAngle += utils.degToRad(this.input.x * deltaTime * this.sensitivity);
        this.pitchAngle += utils.degToRad(this.input.y * deltaTime * this.sensitivity);
        this.distance = clamp(this.distance + this.input.scrollDelta * this.zoomSpeed, this.minDist, this.maxDist);

        const quatYaw = quat.fromAxisAngle(this.up, this.yawAngle);
        const quatPitch = quat.fromAxisAngle([1, 0, 0], this.pitchAngle);
        const transformQuat = quat.multiply(quatYaw, quatPitch);
        const cameraMatrix = mat4.fromQuat(transformQuat);
        mat4.translate(cameraMatrix, [0, 0, this.distance], cameraMatrix);

        return cameraMatrix;
    }
}
