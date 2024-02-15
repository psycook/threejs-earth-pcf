import { networkInterfaces } from "os";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import ThreeEarth from "./ThreeEarth";

export class ThreeEarthPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

  private _context: ComponentFramework.Context<IInputs>;
  private _isInitialised: boolean = false;
  private _container: HTMLDivElement;
  private _width: number = 0;
  private _height: number = 0;
  private _threeEarth: ThreeEarth;

  private _notifyOutputChanged: () => void;

  // these should be set in the manifest
  //private _markerMeshURL = `models/MapMarker2.glb`;
  //private _sceneMeshURL = `models/LowPolyEarth.glb`;
  private _markerMeshURL = `https://raw.githubusercontent.com/psycook/aishowcase/main/MapMarker2.glb`;
  //private _sceneMeshURL = `https://raw.githubusercontent.com/psycook/aishowcase/main/LowPolyEarth.glb`;
  private _sceneMeshURL = 'https://raw.githubusercontent.com/psycook/aishowcase/main/earth.glb';

  constructor() {
  }

  /**
   * 
   * initialise the component
   * 
   * @param context 
   * @param notifyOutputChanged 
   * @param state 
   * @param container 
   */
  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
    // Add control initialization code
    this._context = context;
    this._container = container;
    this._notifyOutputChanged = notifyOutputChanged;

    // track resize changes
    this._context.mode.trackContainerResize(true);
  }


  /**
   * 
   * Update the component when the parameters change
   * 
   * @param context - the context object
   */
  public async updateView(context: ComponentFramework.Context<IInputs>) {
    // get the size of the component
    this._width = context.mode.allocatedWidth;
    this._height = context.mode.allocatedHeight;
    const newAutoRotate = context.parameters.autoRotate.raw as boolean;
    const newRotationSpeed = context.parameters.rotationSpeed.raw as number;
    const markersJSON = context.parameters.markersJSON.raw as string;
    const newCameraDistance = context.parameters.cameraDistance.raw as number;
    const newMarkersScale = context.parameters.markersScale.raw as number;
    const newMarkersRadius = context.parameters.markersRadius.raw as number;

    // check if the component has been initialised
    if (!this._isInitialised) {
      // update the initialised variable
      this._isInitialised = true;

      // set the width & height
      this._container.style.width = this._width + "px";
      this._container.style.height = this._height + "px";

      // create the earth scene
      this._threeEarth = new ThreeEarth(
        this._container, 
        this._width, 
        this._height, 
        newAutoRotate, 
        newRotationSpeed, 
        this._sceneMeshURL, 
        this._markerMeshURL, 
        markersJSON,
        newMarkersScale,
        newMarkersRadius);
    } else {
      // update the size of the component
      if (this._threeEarth) {
        // update the size of the canvas
        this._threeEarth.setSize(this._width, this._height);

        // update the auto rotate and rotation speed
        this._threeEarth.setAutoRotate(newAutoRotate);
        this._threeEarth.setRotationSpeed(newRotationSpeed);
        this._threeEarth.setCameraDistance(newCameraDistance);
        this._threeEarth.setMarkersScale(newMarkersScale);
        this._threeEarth.setMarkersRadius(newMarkersRadius);

        // update the markers
        if(this.isValidJson(markersJSON)) {
          this._threeEarth.setMarkersUsingJSON(markersJSON);
        }
      }
    }
  }

  /**
   * 
   * Returns the outputs of the component
   * 
   * @returns the outputs of the component
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * 
   * destroy the component
   * 
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }

  /**
   * 
   * Check for a valid JSON string
   * 
   * @param jsonString 
   * @returns boolean is the string valid JSON
   */
  private isValidJson(jsonString: string): boolean {
    try {
        JSON.parse(jsonString);
    } catch (e) {
        return false;
    }
    return true;
  }
}
