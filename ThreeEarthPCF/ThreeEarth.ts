import * as Three from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const MARKER_URL: string = "https://raw.githubusercontent.com/psycook/aishowcase/main/MapMarker.glb";

export default class ThreeEarth {
    private _container: HTMLElement;
    private _width: number = 0;
    private _height: number = 0;
    private _sceneURL: string;
    private _gltLoader: GLTFLoader;
    private _scene: Three.Scene;
    private _camera: Three.PerspectiveCamera;
    private _renderer: Three.WebGLRenderer;
    private _earth: Three.Group;
    private _mapMarker: Three.Mesh;

    // the constructor takes an HTMLElement to attach the canvas to
    constructor(container: HTMLElement, width: number, height: number, sceneURL: string) {
        this._container = container;
        this._width = width;
        this._height = height;
        this._sceneURL = sceneURL;
        this._gltLoader = new GLTFLoader();
        this.init();
    }

    private loadMapMarker() {
        this._gltLoader.load(MARKER_URL, (gltf) => {
            this._mapMarker = gltf.scene.getObjectByName("MapMarker") as Three.Mesh;
        });
    }

    // initialize the scene
    private init() {
        // load the marker
        this.loadMapMarker();

        // create the scene
        this._gltLoader.load(this._sceneURL, (gltf) => {
            // create the scene
            this._scene = new Three.Scene();
            this._camera = new Three.PerspectiveCamera(50, (this._width / this._height), 0.1, 1000);
            this._camera.position.set(0, 0, 5);
            this._renderer = new Three.WebGLRenderer({ alpha: false, antialias: true });
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
            pointLight.position.set(-2, 2, 2);
            pointLight.intensity = 10.0;
            this._scene.add(pointLight);

            // add the model to the scene
            this._earth = gltf.scene;
            this._earth.position.set(0, 0, 0);
            this._scene.add(this._earth);

            // add a london marker
            this._earth.add(this.createMarkers());

            // add to the container
            this._container.appendChild(this._renderer.domElement);

            // call animate
            this.animate();
        });
    }

    // animate the scene if required
    public animate() {
        requestAnimationFrame(this.animate.bind(this));
        this._earth.rotation.y -= 0.0025;
        this._renderer.render(this._scene, this._camera);
    }

    // update the scene if required
    public update(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._camera.aspect = (this._width / this._height);
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height, false);
    }

    public createMarkers(): Three.Group {
        const markers = new Three.Group();
        markers.add(this.createMarker(-0.1278, 51.5074, "London"));
        markers.add(this.createMarker(2.3522, 48.8566, "Paris"));
        markers.add(this.createMarker(13.4050, 52.5200, "Berlin"));
        markers.add(this.createMarker(4.8952, 52.3702, "Amsterdam"));
        markers.add(this.createMarker(12.4964, 41.9028, "Rome"));
        markers.add(this.createMarker(2.1734, 41.3851, "Barcelona"));
        markers.add(this.createMarker(16.3738, 48.2082, "Vienna"));
        markers.add(this.createMarker(18.0686, 59.3293, "Stockholm"));
        markers.add(this.createMarker(-74.0060, 40.7128, "New York"));
        return markers;
    }

    // add a marker to the scene
    public createMarker(lon: number, lat: number, name: string): Three.Mesh {
        const markerMaterial = new Three.MeshBasicMaterial({ color: 0xf08040 });
        const marker = new Three.Mesh(this._mapMarker.clone().geometry, markerMaterial);
        marker.scale.set(0.05, 0.05, 0.05);
        marker.position.copy(this.getVector3D(lon, lat, 1.075));
        marker.lookAt(this._earth.position);
        return marker
    }

    // get the Vector3D from lat/lon
    public getVector3D(lon: number, lat: number, radius: number): Three.Vector3 {
        // Convert latitude and longitude from degrees to radians
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        // Convert spherical coordinates to Cartesian coordinates
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // return the vector3
        return new Three.Vector3(x, y, z);
    }
}