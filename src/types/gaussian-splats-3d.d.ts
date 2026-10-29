declare module '@mkkellogg/gaussian-splats-3d' {
  import * as THREE from 'three';

  export interface ViewerOptions {
    rootElement?: HTMLElement;
    camera?: THREE.Camera;
    renderer?: THREE.WebGLRenderer;
    threeScene?: THREE.Scene;
    cameraUp?: [number, number, number] | number[];
    initialCameraPosition?: [number, number, number] | number[];
    initialCameraLookAt?: [number, number, number] | number[];
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    ignoreDevicePixelRatio?: boolean;
    gpuAcceleratedSort?: boolean;
    enableSIMDInSort?: boolean;
    sharedMemoryForWorkers?: boolean;
    integerBasedSort?: boolean;
    splatSortDistanceMapPrecision?: number;
    halfPrecisionCovariancesOnGPU?: boolean;
    dynamicScene?: boolean;
    webXRMode?: number;
    renderMode?: number;
    sceneRevealMode?: number;
    antialiased?: boolean;
    kernel2DSize?: number;
    focalAdjustment?: number;
    logLevel?: number;
    sphericalHarmonicsDegree?: number;
    enableOptionalEffects?: boolean;
    optimizeSplatData?: boolean;
    inMemoryCompressionLevel?: number;
    freeIntermediateSplatData?: boolean;
    splatRenderMode?: number;
    sceneFadeInRateMultiplier?: number;
  }

  export interface SplatSceneOptions {
    format?: number;
    splatAlphaRemovalThreshold?: number;
    showLoadingUI?: boolean;
    position?: [number, number, number] | number[];
    rotation?: [number, number, number, number] | number[];
    scale?: [number, number, number] | number[];
    progressiveLoad?: boolean;
    streamView?: boolean;
    onProgress?: (percent: number, percentLabel: string, chunkType: string) => void;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: unknown;
    splatMesh: unknown;
    threeScene: THREE.Scene;
    rootElement: HTMLElement;
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    addSplatScenes(scenes: Array<{ path: string } & SplatSceneOptions>): Promise<void>;
    start(): void;
    stop(): void;
    dispose(): Promise<void>;
    update(): void;
    render(): void;
  }

  export class DropInViewer extends THREE.Group {
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: SplatSceneOptions): Promise<void>;
    addSplatScenes(scenes: Array<{ path: string } & SplatSceneOptions>): Promise<void>;
    dispose(): Promise<void>;
  }

  export enum SceneFormat {
    Ply = 0,
    Splat = 1,
    KSplat = 2
  }

  export enum RenderMode {
    Always = 0,
    OnChange = 1,
    Never = 2
  }

  export enum SceneRevealMode {
    Default = 0,
    Gradual = 1,
    Instant = 2
  }

  export enum WebXRMode {
    None = 0,
    VR = 1,
    AR = 2
  }

  export enum LogLevel {
    None = 0,
    Minimal = 1,
    Verbose = 2
  }
}

