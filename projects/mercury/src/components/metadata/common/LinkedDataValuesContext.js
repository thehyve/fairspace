import React from "react";

import StringValue from "./values/StringValue";
import ReferringValue from "./values/ReferringValue";
import {METADATA_PATH} from "../../../constants";

/**
 * This context represents the context for the linked data forms.
 *
 * It contains an appropriate instance of a ValueComponentFactory
 *
 * @type {React.Context<{}>}
 */
export const LinkedDataValuesContext = React.createContext({
    editorPath: METADATA_PATH,
    componentFactory: {
        addComponent: () => StringValue,
        editComponent: () => StringValue,
        readOnlyComponent: () => ReferringValue
    }
});
