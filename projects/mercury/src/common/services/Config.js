import merge from 'deepmerge';
import axios from 'axios';
import internalConfig from "../../config.json";

const externalConfigurationFiles = ['/config/config.json'];

class Config {
    static instance;

    internalConfig = {};

    externalConfig = {};

    loaded = false;

    /**
     * Initialize configuration.
     *
     * @param cfg
     * @returns {*}
     */
    constructor(cfg = {}) {
        if (Config.instance) {
            return Config.instance;
        }

        Config.instance = this;
        this.internalConfig = cfg;
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

        this.loadingPromise = Promise.all(
            externalConfigurationFiles.map(file => axios.get(file)
                .catch(({response}) => Promise.reject(Error(`Error loading configuration file ${file} ${response ? response.data : ''}`)))
                .then((response) => {
                    // eslint-disable-next-line no-console
                    console.info("Loaded external configuration from", file);
                    this.externalConfig = merge(this.externalConfig, response.data);
                }))
        ).catch((msg) => {
            // Log error message and continue with the default configuration
            console.warn(msg);
        }).then(() => {
            this.loaded = true;
            this.fullConfig = merge({...this.internalConfig}, this.externalConfig);
            return this.fullConfig;
        });

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

export default new Config(internalConfig);
