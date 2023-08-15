import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as Three from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ThreeEarthPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>;
    private _isInitialised: boolean = false;
    private _container: HTMLDivElement;
    private _width: number = 0;
    private _height: number = 0;
    private _scene: Three.Scene;
    private _camera: Three.PerspectiveCamera;
    private _renderer: Three.WebGLRenderer;
    private _cube: Three.Mesh;
    private _earth: Three.Group;

    private _notifyOutputChanged: () => void;

    /**
     * Empty constructor.
     */
    constructor() {
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        // Add control initialization code
        this._context = context;
        this._context.mode.trackContainerResize(true);
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // get the size of the component
        this._width = context.mode.allocatedWidth;
        this._height = context.mode.allocatedHeight;

        if (!this._isInitialised) {
            this._isInitialised = true;

            // add the earth
            console.log(`adding model to scene`);
            const gltLoader = new GLTFLoader();
            gltLoader.load('https://raw.githubusercontent.com/psycook/aishowcase/main/LowPolyEarth.glb', (gltf) => {

                // create the scene
                this._scene = new Three.Scene();
                this._camera = new Three.PerspectiveCamera(50, (this._width / this._height), 0.1, 1000);
                this._camera.position.set(0, 0, 5);
                this._renderer = new Three.WebGLRenderer({ alpha: false, antialias: true });
                this._renderer.setSize(this._width, this._height, false);
                //this._renderer.setPixelRatio(window.devicePixelRatio);
                this._renderer.toneMapping = Three.ACESFilmicToneMapping;
                this._renderer.outputColorSpace = Three.SRGBColorSpace;

                //add orbit controls
                const controls = new OrbitControls(this._camera, this._renderer.domElement)
                controls.enableDamping = true;
                controls.dampingFactor = 0.25;
                controls.enableZoom = true;
                controls.zoomSpeed = 0.25;

                // add ambient lightning
                const ambientLight = new Three.AmbientLight(0xffffff, 1.0);
                this._scene.add(ambientLight);

                // add a point light
                const pointLight = new Three.PointLight();
                pointLight.position.set(-2, 2, 2);
                pointLight.intensity = 10.0;
                this._scene.add(pointLight);

                // add the model to the scene
                this._earth = gltf.scene;

                // display the node details in the scene
                this._earth.traverse((o:Three.Object3D) => 
                    {
                        console.log(`Type is ${o.type}, it's name is ${o.name}, size is ${JSON.stringify(o.scale)}, position is ${JSON.stringify(o.position)}`);
                    }
                );
                this._earth.position.set(0, 0, 0);
                this._scene.add(this._earth);

                // add to the container
                this._container.appendChild(this._renderer.domElement);

                // call animate
                this.animate();
            }
            )
        } else {
            // update the size of the component
            this._camera.aspect = (this._width / this._height);
            this._camera.updateProjectionMatrix();
            this._renderer.setSize(this._width, this._height, false);
        }
    }

    public animate() {
        requestAnimationFrame(this.animate.bind(this));
        this._earth.rotation.y -= 0.005;
        this._renderer.render(this._scene, this._camera);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
