import { WebGPURenderer } from "./renderer";
// import { generateCube } from "./primitives";
import { GLTFLoader } from "./gltf-mesh-loader";
import { MeshEntity } from "./mesh-entity";
import { LightEntity, LightType } from "./light";
import { vec3 } from "wgpu-matrix";
// import { createLitMaterial, createUnlitMaterial } from "./material-library";
// import { Mesh } from "./mesh";

const DEBUG = false;
const renderer = new WebGPURenderer();

const run = async () => {
    await renderer.init("viewport");

    // const cubeMesh = generateCube();
    // const cubeEntity = new MeshEntity(cubeMesh);
    // cubeMesh.material = await createUnlitMaterial();
    // cubeEntity.transform.translate(3.5, 0, 1);
    // renderer.addEntity(cubeEntity);
    // cubeMesh.material.setScalar("testcolor", vec4.create(1.0, 0, 1.0, 1.0));

    const octoMesh = await GLTFLoader.loadScene("./mesh/octo.gltf");
    const octoEntity = new MeshEntity(octoMesh.meshes[0]); 
    await octoMesh.meshes[0].material.setTexture("albedo", "./mesh/octo.png");
    octoEntity.transform.setScale(250, 250, 250);
    octoEntity.transform.translate(-350, 0, -100);
    octoEntity.transform.rotate(0, 90, 0);
    renderer.addEntity(octoEntity);

    const testScene = await GLTFLoader.loadScene("./mesh/Sponza.gltf");

    for (const mesh of testScene.meshes) {
        const newEntity = new MeshEntity(mesh);
        renderer.addEntity(newEntity);
        newEntity.transform.translate(0, -150, 0);
    }

    const dirLight = new LightEntity({
        type: LightType.Directional,
        intensity: 1.0,
        color: vec3.create(1, 1 ,1)
    });
    dirLight.transform.rotate(-45, 45, 0);
    renderer.addEntity(dirLight);
};

export default async () => {
    await run();
    let lastFrameTime = performance.now();
    const renderLoop = () => {
        const currentFrame = performance.now() - lastFrameTime;
        lastFrameTime = performance.now();
        if (DEBUG) console.log(currentFrame + " ms");

        renderer.renderFrame();
        requestAnimationFrame(renderLoop);
    };

    renderLoop();
};
