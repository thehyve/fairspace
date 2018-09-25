import ReferringValue from "./ReferringValue";
import StringValue from "./StringValue";
import LookupEntity from "./LookupEntity";

export default {
    editComponent: (property) => {
        switch(property.range) {
            case 'http://www.w3.org/TR/xmlschema11-2/#string':
                return StringValue;
            default:
                return ReferringValue;
        }
    },
    addComponent: (property) => {
        switch(property.range) {
            case 'http://www.w3.org/TR/xmlschema11-2/#string':
                return StringValue;
            default:
                return LookupEntity;
        }
    }

}
