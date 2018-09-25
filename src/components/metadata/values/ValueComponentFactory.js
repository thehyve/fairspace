import ReferringValue from "./ReferringValue";
import StringValue from "./StringValue";

export default {
    build: (property) => {
        switch(property.range) {
            case 'http://www.w3.org/TR/xmlschema11-2/#string':
                return StringValue;
            default:
                return ReferringValue;
        }
    }
}
