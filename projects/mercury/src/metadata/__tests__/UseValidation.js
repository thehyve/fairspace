import {act} from 'react-dom/test-utils';
import {testHook} from "@fairspace/shared-frontend";
import useValidation from "../UseValidation";
import {SHACL_MIN_COUNT} from "../../constants";

let validation;
beforeEach(() => {
    testHook(() => {
        validation = useValidation();
    });
});

describe('useValidation', () => {
    it('should be valid by default', () => {
        expect(validation.isValid).toBe(true);
    });

    it('should store state for validation errors', () => {
        const property = {
            key: 'a',
            shape: {[SHACL_MIN_COUNT]: [{'@value': 1}]},
            datatype: '',
            isGenericIriResource: false,
        };

        act(() => {
            expect(validation.validateProperty(property, [])).toBe(true);
        });

        expect(validation.isValid).toBe(false);
        expect(validation.validationErrors.a).toBeTruthy();
    });

    it('should override state on second validation', () => {
        const property = {
            key: 'a',
            shape: {[SHACL_MIN_COUNT]: [{'@value': 1}]},
            datatype: '',
            isGenericIriResource: false,
        };

        act(() => {
            expect(validation.validateProperty(property, [])).toBe(true);
        });

        expect(validation.isValid).toBe(false);

        act(() => {
            expect(validation.validateProperty(property, [{value: '1'}])).toBe(false);
        });

        expect(validation.isValid).toBe(true);
    });
});
