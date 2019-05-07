import * as constants from "../constants";
import {
    maxLengthValidation,
    minCountValidation,
    maxCountValidation,
    validateValuesAgainstShape,
    removeWhitespaceValues
} from './validationUtils';

describe('Validation Utils', () => {
    describe('maxLengthValidation', () => {
        it('should return error message when length is over limit', () => {
            const values = ['This is some text that is over 10 characters'];
            expect(maxLengthValidation(10, values)).not.toBeNull();
        });
        it('should not return error message when length is within limit', () => {
            const values = ['This is some text that is over 10 characters'];
            expect(maxLengthValidation(1000, values)).toBeNull();
        });
        it('should not return error message when length equals limit', () => {
            const values = ['123'];
            expect(maxLengthValidation(3, values)).toBeNull();
        });
    });

    describe('minCountValidation', () => {
        it('should return error message when values count is less than min', () => {
            const values = ['First', 'Second'];
            expect(minCountValidation(6, values)).not.toBeNull();
        });
        it('should not return error message when values count equlas min', () => {
            const values = ['First', 'Second', '3rd', '4th'];
            expect(minCountValidation(4, values)).toBeNull();
        });
        it('should not return error message when values count is more than min', () => {
            const values = ['First', 'Second', '3rd', '4th', '5th'];
            expect(minCountValidation(4, values)).toBeNull();
        });
    });

    describe('maxCountValidation', () => {
        it('should return error message when values count is more than max', () => {
            const values = ['First', 'Second'];
            expect(maxCountValidation(1, values)).not.toBeNull();
        });
        it('should not return error message when values count equlas max', () => {
            const values = ['First', 'Second', '3rd', '4th'];
            expect(maxCountValidation(4, values)).toBeNull();
        });
        it('should not return error message when values count is lessmore than max', () => {
            const values = ['First', 'Second', '3rd', '4th', '5th'];
            expect(maxCountValidation(6, values)).toBeNull();
        });
    });

    describe('validateValuesAgainstShape', () => {
        it('should return all error messages (max length, min count)', () => {
            const shape = {
                "@id": "http://www.w3.org/2000/01/rdf-schema#labelShape",
                [constants.SHACL_MAX_LENGTH]: [
                    {
                        "@value": 10
                    }
                ],
                [constants.SHACL_MIN_COUNT]: [
                    {
                        "@value": 2
                    }
                ]
            };

            const values = [{value: 'This is some text that is over 10 characters'}];
            const datatype = constants.STRING_URI;
            expect(validateValuesAgainstShape({shape, datatype, values}).length).toBe(2);
            expect(validateValuesAgainstShape({shape, datatype, values})[0].length).toBeGreaterThan(0);
            expect(validateValuesAgainstShape({shape, datatype, values})[1].length).toBeGreaterThan(0);
        });

        it('should return an error for max count', () => {
            const shape = {
                "@id": "http://www.w3.org/2000/01/rdf-schema#labelShape",
                [constants.SHACL_MAX_COUNT]: [
                    {
                        "@value": 2
                    }
                ]
            };

            const values = [{value: 0}, {value: 10}, {value: 100}];
            expect(validateValuesAgainstShape({shape, values}).length).toBe(1);
            expect(validateValuesAgainstShape({shape, values})[0].length).toBeGreaterThan(0);
        });

        it('should ignore falsy values but zero', () => {
            const shape = {
                "@id": "http://www.w3.org/2000/01/rdf-schema#labelShape",
                [constants.SHACL_MAX_LENGTH]: [
                    {
                        "@value": 1
                    }
                ],
                [constants.SHACL_MIN_COUNT]: [
                    {
                        "@value": 1
                    }
                ]
            };

            const values = [{value: 0}, {}, {value: null}, {value: undefined}, {value: NaN}];
            expect(validateValuesAgainstShape({shape, values}).length).toBe(0);
        });

        it('should ignore falsy values but false', () => {
            const shape = {
                "@id": "http://www.w3.org/2000/01/rdf-schema#labelShape",
                [constants.SHACL_MAX_LENGTH]: [
                    {
                        "@value": 1
                    }
                ],
                [constants.SHACL_MIN_COUNT]: [
                    {
                        "@value": 1
                    }
                ]
            };

            const values = [{value: false}, {}, {value: null}, {value: undefined}, {value: NaN}];
            expect(validateValuesAgainstShape({shape, values}).length).toBe(0);
        });
    });

    describe('removeWhitespaceValues', () => {
        it('should filter out values that contain only whitespace', () => {
            const values = [' ', 'abc', '   '];
            expect(removeWhitespaceValues(values)).toEqual(['abc']);
        });
    });
});
