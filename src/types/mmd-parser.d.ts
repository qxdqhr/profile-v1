declare module 'mmd-parser' {
  export interface MMDModel {
    metadata: {
      format: string;
      version: number;
      modelName: string;
      comment: string;
    };
    vertices: Array<{
      position: [number, number, number];
      normal: [number, number, number];
      uv: [number, number];
      skinning: {
        boneIndices: number[];
        boneWeights: number[];
      };
    }>;
    faces: Array<{
      indices: [number, number, number];
    }>;
    materials: Array<{
      diffuse: [number, number, number, number];
      specular: [number, number, number];
      shininess: number;
      texture?: string;
    }>;
    bones: Array<{
      name: string;
      parentIndex: number;
      position: [number, number, number];
      rotation?: [number, number, number, number];
    }>;
    morphs?: Array<{
      name: string;
      type: number;
      vertices: Array<{
        index: number;
        position: [number, number, number];
      }>;
    }>;
  }

  export interface MMDAnimation {
    metadata: {
      format: string;
      version: number;
      modelName?: string;
    };
    bones: Record<string, {
      frames: Array<{
        time: number;
        position: [number, number, number];
        rotation: [number, number, number, number];
        interpolation?: number[];
      }>;
    }>;
    morphs?: Record<string, {
      frames: Array<{
        time: number;
        weight: number;
      }>;
    }>;
  }

  export class MMDParser {
    static parsePmd(buffer: ArrayBuffer): MMDModel;
    static parsePmx(buffer: ArrayBuffer): MMDModel;
    static parseVmd(buffer: ArrayBuffer): MMDAnimation;
    static parseVpd(buffer: ArrayBuffer): any;
  }
} 