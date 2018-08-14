import internalConfig from "../../../config";

class Config {
    static instance;

    internalConfig = {};
    externalConfig = {};
    loaded = false;

    /**
     * Initialize configuration.
     *
     * @param providedConfig
     * @returns {*}
     */
    constructor() {
        if(Config.instance) {
            return Config.instance;
        }

        Config.instance = this;
        this.internalConfig = internalConfig;
    }

    /**
     * This initialization allows to load external configuration files if needed
     * @returns {Promise<any> | *}
     */
    init() {
        this.loaded = true;
        this.fullConfig = this.internalConfig;
        this.loadingPromise = Promise.resolve(this.fullConfig);

        return this.loadingPromise;
    }

    /**
     * Returns a promise that resolves with the loaded configuration options
     * @returns {Promise<any[]> | *}
     */
    waitFor() { return this.loadingPromise; }

    /**
     * Returns the full configuration, including all dependencies
     * @returns {*}
     */
    get() {
        if(!this.loaded) {
            throw Error("Configuration has not been loaded yet. Use the waitFor method to wait for configuration to be loaded.")
        }
        return this.fullConfig;
    }

    /**
     * Sets the internal configuration. Can be used for testing purposes
     * @param configuration
     */
    setConfig(configuration) {
        this.internalConfig = configuration;
    }

}

export default new Config();