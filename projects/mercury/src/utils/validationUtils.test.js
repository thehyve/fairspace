import {maxLengthValidation, minCountValidation, maxCountValidation} from './validationUtils';

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
});
