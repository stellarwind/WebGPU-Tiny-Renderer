import { Material } from "./material";
// @ts-ignore
import { createLitMaterial, createUnlitMaterial } from "./material-library";
import { Mesh } from "./mesh";

export interface LoadedScene {
    meshes: Mesh[];
    materials: Material[];
}

function getAccessorData(gltf: any, accessorIndex: number, arrayBuffer: ArrayBuffer): any {
    const accessor = gltf.accessors[accessorIndex];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    
    const componentTypeMap: Record<number, any> = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5125: Uint32Array,
        5126: Float32Array,
    };

    const typedArray = componentTypeMap[accessor.componentType];

    const numComponentsMap: Record<string, number> = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
        "VEC4": 4,
        "MAT4": 16
    }
    const numComponents = numComponentsMap[accessor.type];

    // Important -- Sponza has various offsets
    const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);

    return new typedArray(
        arrayBuffer,
        byteOffset,
        accessor.count * numComponents
    );
}

export class GLTFLoader {

    public static async loadScene(fileName: string): Promise<LoadedScene> {
        const file = await fetch(fileName);

        if (!file.ok)
            return Promise.reject(
                console.error(`Failed to load file:${file.statusText}`)
            );

        const gltf = await file.json();

        const buffer = gltf.buffers[0];
        const binResponse = await fetch("./mesh/" + buffer.uri);
        const arrayBuffer = await binResponse.arrayBuffer();

        const meshes: Mesh[] = [];
        const materials: Material[] = [];

        const traverseNode = (nodeIndex: number) => {
            const node = gltf.nodes[nodeIndex];

            if (node.mesh !== undefined) {
                const meshDef = gltf.meshes[node.mesh];
                for (const primitive of meshDef.primitives) {

                    const vertexData = getAccessorData(gltf, primitive.attributes.POSITION, arrayBuffer);

                    const nrmData = primitive.attributes.NORMAL !== undefined ? getAccessorData(gltf, primitive.attributes.NORMAL, arrayBuffer) : null;

                    const uvData = primitive.attributes.TEXCOORD_0 !== undefined ? getAccessorData(gltf, primitive.attributes.TEXCOORD_0, arrayBuffer) : null;

                    const indexData = primitive.indices !== undefined ? getAccessorData(gltf, primitive.indices, arrayBuffer) : null;

                    const meshData = new Mesh(
                        vertexData,
                        indexData,
                        null,
                        nrmData,
                        uvData,
                        primitive.material ?? null
                    );
                    
                    meshes.push(meshData);
                }
            }

            if (node.children) {
                node.children.forEach((childIdx: number) =>
                    traverseNode(childIdx)
                );
            }
        };

        const scene = gltf.scenes[gltf.scene];
        scene.nodes.forEach((nodeIndex: number) => traverseNode(nodeIndex));

        // Textures
        let textures = [];
        let images = [];
        if (gltf.images !== undefined && gltf.textures !== undefined) {
            for (const img of gltf.images) {
                const uri = "./mesh/" + img.uri;
                images.push(uri);
            }

            for (const tex of gltf.textures) {
                textures.push(images[tex.source]);
            }
        }

        // Create materials, assign textures
        for (const mesh of meshes) {
            mesh.material = await createLitMaterial();
            if (mesh.gltfMaterialIndex !== null) {
                const matDef = gltf.materials[mesh.gltfMaterialIndex];
                const baseColorTex = matDef.pbrMetallicRoughness?.baseColorTexture ?? null;
                if (baseColorTex) {
                    const texUri = textures[baseColorTex.index];
                    if (texUri) {
                        await mesh.material.setTexture("albedo", texUri);
                    }
                }
            }
        }

        return { meshes, materials };
    }
}
