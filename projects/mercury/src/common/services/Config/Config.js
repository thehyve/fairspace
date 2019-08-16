import merge from 'deepmerge';
import axios from 'axios';

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
        if (Config.instance) {
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
        // Avoid double initialization
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        // Load external configuration files. Please note that
        // if multiple files are provided, there is no guarantee
        // about ordering, so it is best for the configuration files
        // not to contain the same properties.
        if (this.internalConfig.externalConfigurationFiles) {
            this.loadingPromise = Promise.all(
                this.internalConfig.externalConfigurationFiles.map(file => axios.get(file)
                    .catch(({response}) => Promise.reject(Error(`Error loading configuration file ${file} ${response ? response.data : ''}`)))
                    .then((response) => {
                        console.info("Loaded external configuration from", file);
                        this.externalConfig = merge(this.externalConfig, response.data);
                    }))
            ).catch((msg) => {
                // Log error message and continue with the default configuration
                console.warn(msg);
            }).then(() => {
                this.loaded = true;
                this.fullConfig = merge(Object.assign({}, this.internalConfig), this.externalConfig);
                return this.fullConfig;
            });
        } else {
            this.loaded = true;
            this.fullConfig = this.internalConfig;
            this.loadingPromise = Promise.resolve(this.fullConfig);
        }

        return this.loadingPromise;
    }

    /**
     * Returns a promise that resolves with the loaded configuration options
     * @returns {Promise<any[]> | *}
     */
    waitFor() {return this.loadingPromise;}

    /**
     * Returns the full configuration, including all dependencies
     * @returns {*}
     */
    get() {
        if (!this.loaded) {
            throw Error("Configuration has not been loaded yet. Use the waitFor method to wait for configuration to be loaded.");
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
