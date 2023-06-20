// @ts-nocheck
import axios from "axios";
import LinkedDataAPI from "./LinkedDataAPI";
import {toJsonLd} from "./jsonLdConverter";
import {handleHttpError} from "../../common/utils/httpUtils";

class MetadataAPI extends LinkedDataAPI {
    constructor() {
        super('metadata');
    }

    /**
   * Updates or creates a new entity
   * @param subject    Single URI representing the subject to update
   * @param properties An object with each key is the iri of the predicate to update
   * and the value is the array of values
   * Each value is an object on its own with one of the following keys
   *   id: referencing another resource
   *   value: referencing a literal value
   * If both keys are specified, the id is stored and the literal value is ignored
   * @param vocabulary The {vocabularyUtils} object containing the shapes for this metadata entity
   * @param type       Entity type. Can be null for existing entities
   * @returns {*}
   */
    updateEntity(subject, properties, vocabulary, type = null) {
        if (!subject || !properties) {
            return Promise.reject(Error("No subject or properties given"));
        }

        const jsonLd = Object.keys(properties).map(p => toJsonLd(subject, p, properties[p], vocabulary));

        if (type) {
            jsonLd.push({
                '@id': subject,
                '@type': type
            });
        }

        return this.patch(jsonLd).catch(handleHttpError("Failure when updating entity"));
    }

    /**
   * Send a patch request to the backend with the given json-ld
   * @param jsonLd
   * @returns {Promise<Response>}
   */
    patch(jsonLd) {
        return axios.patch(this.getStatementsUrl(), JSON.stringify(jsonLd), {
            headers: {
                'Content-type': 'application/ld+json'
            }
        });
    }

    /**
   * Deletes a subject from the metadata store
   * @param subject
   * @returns {Promise<Response>}
   */
    delete(subject) {
        return axios.delete(this.getStatementsUrl() + "?subject=" + encodeURIComponent(subject)).catch(handleHttpError("Failure when deleting subject"));
    }

}

export default new MetadataAPI();