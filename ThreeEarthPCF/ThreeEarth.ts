import * as Three from 'three';
import { MapMarkerHelper, MARKERS_GROUP_NAME } from './MapMarkerHelper';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const EARTH_MESH_NAME = "Earth";

export default class ThreeEarth {
    private _container: HTMLElement;
    private _width: number = 0;
    private _height: number = 0;
    private _markerMeshURL: string;
    private _sceneURL: string;
    private _scene: Three.Scene;
    private _camera: Three.PerspectiveCamera;
    private _renderer: Three.WebGLRenderer;
    private _earthMesh: Three.Group;
    private _mapMarkerHelper: MapMarkerHelper;
    private _autoRotate: boolean = false;
    private _rotateSpeed: number = 0.01;
    private _markersJSON: string;

    // the constructor takes an HTMLElement to attach the canvas to
    constructor(container: HTMLElement, width: number, height: number, autoRotate: boolean, rotateSpeed: number, sceneURL: string, markerMeshURL: string, markersJSON: string) {
        this._container = container;
        this._width = width;
        this._height = height;
        this._autoRotate = autoRotate;
        this._rotateSpeed = rotateSpeed;
        this._sceneURL = sceneURL;
        this._markerMeshURL = markerMeshURL;
        this._markersJSON = markersJSON;
        this.init();
    }

    /**
     * 
     * Initialise the new scene.  Loads the mesh for the earth
     * 
     */
    private init() {
        // create the scene
        this._scene = new Three.Scene();
        this._camera = new Three.PerspectiveCamera(50, (this._width / this._height), 0.1, 1000);
        this._camera.position.set(0, 0, 5);
        this._renderer = new Three.WebGLRenderer({ alpha: true, antialias: true });
        this._renderer.setSize(this._width, this._height, false);
        this._renderer.toneMapping = Three.ACESFilmicToneMapping;
        this._renderer.outputColorSpace = Three.SRGBColorSpace;

        //add orbit controls
        const controls = new OrbitControls(this._camera, this._renderer.domElement)
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.50;

        // add ambient lightning
        const ambientLight = new Three.AmbientLight(0xffffff, 1.0);
        this._scene.add(ambientLight);

        // add a point light
        const pointLight = new Three.PointLight();
        //pointLight.castShadow = true;
        pointLight.position.set(-2, 2, 2);
        pointLight.intensity = 10.0;
        this._scene.add(pointLight);

        // load the mesh
        new GLTFLoader().load(this._sceneURL, (gltf) => {
            this.earthMeshLoaded(gltf.scene);
        });

        // add to the container
        this._container.appendChild(this._renderer.domElement);
}


    /**
     * 
     * A callback for when the earth mesh is loaded
     * 
     * @param earthMesh 
     * 
     */
    private earthMeshLoaded(earthMesh: Three.Group) {
        // is there already a mesh for the earth?  If so, remove
        const existingEarthMesh = this._scene.getObjectByName(EARTH_MESH_NAME);
        if(existingEarthMesh) {
            this._scene.remove(existingEarthMesh);
        }

        // add the model to the scene
        this._earthMesh = earthMesh;

        // set the name of the mesh
        // this._earthMesh.traverse((child) => {
        //     if(child instanceof Three.Mesh) {
        //         child.receiveShadow = true;
        //     }
        // });


        this._earthMesh.name = EARTH_MESH_NAME;
        this._earthMesh.position.set(0, 0, 0);
        this._scene.add(this._earthMesh);

        // create the mesh marker helper
        this._mapMarkerHelper = new MapMarkerHelper(this._markerMeshURL, () => {
            this.setMarkersUsingJSON(this._markersJSON);
        });

        // call animate
        this.animate();
    }

    /** 
     * 
     *  Animate the scene if required
     * 
     * */ 
    public animate() {
        requestAnimationFrame(this.animate.bind(this));
        this._earthMesh.rotation.y -= this._autoRotate ? this._rotateSpeed : 0;
        this._renderer.render(this._scene, this._camera);
    }


    /** 
     * 
     *  Update the markers using a JSON array
     * 
     * */ 
    public setMarkersUsingJSON(markersJSON: string) {
        // creating the group
        const markers = this._mapMarkerHelper.createMarkersFromJSON(markersJSON, this._earthMesh.position);

        // remove the existing makers from the scene
        const markersGroup = this._earthMesh.getObjectByName(MARKERS_GROUP_NAME);
        markersGroup?.removeFromParent();

        // add the new markers to the scene
        this._earthMesh.add(markers);
    }

    /**
     * 
     * Set the new width and height for the scene
     * 
     * @param width   - the new width of the scene
     * @param height  - the new height of the scene
     */
    public setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._camera.aspect = (this._width / this._height);
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height, false);
    }

    /**
     * 
     * Update the speed of the rotation
     * 
     * @param newValue - the new speed of the rotation
     */
    public setRotationSpeed(newValue: number) {
        this._rotateSpeed = newValue;
    }


    /**
     * 
     * Update the value of the autorotation
     * 
     * @param newValue - the new value of the autorotation 
     */
    public setAutoRotate(newValue: boolean) {
        this._autoRotate = newValue;
    }

}