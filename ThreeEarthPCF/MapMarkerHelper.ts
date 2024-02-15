import * as Three from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const MARKERS_GROUP_NAME: string = "mapMarkersGroup";

export class MapMarkerHelper {
    private _meshURL : string;
    private _mesh: Three.Mesh;

    // the constructor 
    constructor(meshURL: string, callback: () => void) {
        // create default mesh
        this._meshURL = meshURL;

        // load the mesh and call the callback
        new GLTFLoader().load(this._meshURL, (gltf) => {
            // get the first child of the scene
            this._mesh = gltf.scene.children[0] as Three.Mesh;
            // call the callback
            callback();
         });
    }

    // create markers from data
    public createMarkersFromJSON(jsonString : string, lookAtPos : Three.Vector3, newRadius : number, newScale : number) : Three.Group {
        const markers = new Three.Group();
        const radius = newRadius;
        const scale = newScale;

        // set the name of the group
        markers.name = MARKERS_GROUP_NAME;

        // parse the json
        const markersArray = JSON.parse(jsonString);
        markersArray.forEach((marker: any) => {
            markers.add(this.createMarker(marker.lon, marker.lat, radius, scale, marker.name, lookAtPos));
        });
        return markers;
    }

    // create a marker
    public createMarker(
            lon: number, 
            lat: number, 
            radius: number,
            scale: number,
            name: string, 
            lookAtPos: Three.Vector3): Three.Mesh {

        console.log("creating marker");

        //const markerMaterial = new Three.MeshBasicMaterial({ color: 0xf08040 });
        const marker = new Three.Mesh(this._mesh.clone().geometry, this._mesh.clone().material);
        marker.scale.set(scale, scale, scale);
        marker.position.copy(this.getVector3D(lon, lat, radius));
        marker.lookAt(lookAtPos);
        console.log(`adding marker ${marker.name} at ${marker.position.x}, ${marker.position.y}, ${marker.position.z} using radius ${radius} and scale ${scale}`);
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