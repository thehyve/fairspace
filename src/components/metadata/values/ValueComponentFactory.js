import ReferringValue from "./ReferringValue";
import StringValue from "./StringValue";
import LookupEntity from "./LookupEntity";
import {STRING_URI} from "../../../services/MetadataAPI/MetadataAPI";

export default {
    editComponent: (property) => {
        switch(property.range) {
            case STRING_URI:
                return StringValue;
            default:
                return ReferringValue;
        }
    },
    addComponent: (property) => {
        switch(property.range) {
            case STRING_URI:
                return StringValue;
            default:
                return LookupEntity;
        }
    }

}
