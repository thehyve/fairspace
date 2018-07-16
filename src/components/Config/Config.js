import internalConfig from "../../config";
import merge from 'deepmerge'

class Config {
    static instance;

    externalConfig = {};
    loaded = false;

    constructor() {
        if(Config.instance) {
            return Config.instance;
        }

        Config.instance = this;

        // Load external configuration files. Please note that
        // if multiple files are provided, there is no guarantee
        // about ordering, so it is best for the configuration files
        // not to contain the same properties.
        if(internalConfig.externalConfigurationFiles) {
            this.loadingPromise = Promise.all(
                internalConfig.externalConfigurationFiles.map(file => {
                    return fetch(file)
                        .then(response => {
                            if(response.ok && response.data) {
                                console.log("Current: ", Config.instance.externalConfig, response.data);
                                Config.instance.externalConfig = merge(Config.instance.externalConfig, response.data);
                            }
                        });

                })
            ).then(() => {
                this.loaded = true;
                this.fullConfig = merge(Object.assign({}, internalConfig), this.externalConfig);
                return this.fullConfig;
            })
        }

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

}

export default new Config();