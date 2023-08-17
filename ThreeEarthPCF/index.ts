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
  private _markerMeshURL = `models/MapMarker.glb`;
  private _sceneMeshURL = `models/LowPolyEarth.glb`;
  //private _markerMeshURL = `https://raw.githubusercontent.com/psycook/aishowcase/main/MapMarker.glb`;
  //private _sceneMeshURL = `https://raw.githubusercontent.com/psycook/aishowcase/main/LowPolyEarth.glb`;
  //private _markersJSON = `[ { "lon": -73.935242, "lat": 40.730610, "name": "New York" }, { "lon": 2.352222, "lat": 48.856614, "name": "Paris" }, { "lon": 13.4050, "lat": 52.5200, "name": "Berlin" }, { "lon": 139.6917, "lat": 35.6895, "name": "Tokyo" }, { "lon": -46.633308, "lat": -23.550520, "name": "São Paulo" }, { "lon": 121.4737, "lat": 31.2304, "name": "Shanghai" }, { "lon": 77.2090, "lat": 28.6139, "name": "New Delhi" }, { "lon": 37.6173, "lat": 55.7558, "name": "Moscow" }, { "lon": -3.7038, "lat": 40.4168, "name": "Madrid" } ]`;

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
        markersJSON);
    } else {
      // update the size of the component
      if (this._threeEarth) {
        // update the size of the canvas
        this._threeEarth.setSize(this._width, this._height);

        // update the auto rotate and rotation speed
        this._threeEarth.setAutoRotate(newAutoRotate);
        this._threeEarth.setRotationSpeed(newRotationSpeed);

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
