import { Transform } from "./transform";

export abstract class Entity {
    private transform_: Transform = new Transform();

    public get transform() {
        return this.transform_;
    }

    abstract get shaderData(): Float32Array;

    public name: string = "";

    public readonly id: string = crypto.randomUUID();

    constructor(name: string = "New Entity") {
        this.name = name;
    }
}
