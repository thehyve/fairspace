import {extractJsonData, handleHttpError} from "../httpUtils";

describe('Http Utils', () => {
    describe('handleHttpError', () => {
        it('Should redirect to the login page on 401 and throw exception', () => {
            window.location.assign = jest.fn();
            expect(() => handleHttpError("Default error")({response: {status: 401}})).toThrow();
            expect(window.location.assign).toHaveBeenCalledWith('/login?redirectUrl=http://localhost/');
        });

        it('Should throw an exception with the backend error on responses other than 401', () => {
            expect(
                () => {
                    handleHttpError("Default error")({
                        response: {status: 500, data: {message: 'Backend error'}}
                    });
                }
            ).toThrow(new Error('Backend error'));
        });
    });

    describe('extractJsonData', () => {
        it('Should extract the data of types: application/json and application/ld+json', () => {
            const data = {dummy: true};
            const jsonType = {'content-type': 'application/json'};
            const jsonLdType = {'content-type': 'application/ld+json'};

            expect(extractJsonData({headers: jsonType, data})).toEqual(data);
            expect(extractJsonData({headers: jsonLdType, data})).toEqual(data);
        });

        it('Should throw an error for non json content types', () => {
            const data = {dummy: true};

            expect(() => extractJsonData({headers: {}, data})).toThrow();
            expect(() => extractJsonData({headers: {'content-type': 'application/html'}, data})).toThrow();
        });
    });
});
