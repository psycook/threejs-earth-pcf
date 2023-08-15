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
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // track resize changes
        this._context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // get the size of the component
        this._width = context.mode.allocatedWidth;
        this._height = context.mode.allocatedHeight;

        // check if the component has been initialised
        if (!this._isInitialised) {
            this._isInitialised = true;
            this._container.style.width = this._width + "px";
            this._container.style.height = this._height + "px";
            this._threeEarth = new ThreeEarth(
                this._container, 
                this._width, 
                this._height, 
                `https://raw.githubusercontent.com/psycook/aishowcase/main/LowPolyEarth.glb`
            );
        } else {
            // update the size of the component
            if(this._threeEarth)
            {
                this._threeEarth.update(this._width, this._height);
            }
        }
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

    // test data - delete this
    private  testData1 ={
        "markers": [
          {
            "longitude": -0.1278,
            "latitude": 51.5074,
            "name": "London"
          },
          {
            "longitude": 2.3522,
            "latitude": 48.8566,
            "name": "Paris"
          },
          {
            "longitude": 13.4050,
            "latitude": 52.5200,
            "name": "Berlin"
          },
          {
            "longitude": 4.8952,
            "latitude": 52.3702,
            "name": "Amsterdam"
          },
          {
            "longitude": 12.4964,
            "latitude": 41.9028,
            "name": "Rome"
          },
          {
            "longitude": 2.1734,
            "latitude": 41.3851,
            "name": "Barcelona"
          },
          {
            "longitude": 16.3738,
            "latitude": 48.2082,
            "name": "Vienna"
          },
          {
            "longitude": 18.0686,
            "latitude": 59.3293,
            "name": "Stockholm"
          },
          {
            "longitude": -74.0060,
            "latitude": 40.7128,
            "name": "New York"
          }
        ]
      };

      private  testData2 = {
        "markers": [
          {
            "longitude": 121.4740,
            "latitude": 31.2304,
            "name": "Shanghai"
          },
          {
            "longitude": 139.6917,
            "latitude": 35.6895,
            "name": "Tokyo"
          },
          {
            "longitude": -58.3816,
            "latitude": -34.6037,
            "name": "Buenos Aires"
          },
          {
            "longitude": 151.2093,
            "latitude": -33.8688,
            "name": "Sydney"
          },
          {
            "longitude": 72.8777,
            "latitude": 19.0760,
            "name": "Mumbai"
          },
          {
            "longitude": -43.1729,
            "latitude": -22.9068,
            "name": "Rio de Janeiro"
          },
          {
            "longitude": 31.2357,
            "latitude": 30.0444,
            "name": "Cairo"
          },
          {
            "longitude": 126.9780,
            "latitude": 37.5665,
            "name": "Seoul"
          },
          {
            "longitude": -0.1257,
            "latitude": 51.5085,
            "name": "London"
          }
        ]
      };
      
}
