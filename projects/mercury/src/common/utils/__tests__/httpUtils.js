import {extractJsonData, handleHttpError} from "../httpUtils";
import ErrorDialog from "../../components/ErrorDialog";

describe('Http Utils', () => {
    describe('handleHttpError', () => {
        it('Should show an error on 401', () => {
            window.location.assign = jest.fn();
            ErrorDialog.showError = jest.fn();
            handleHttpError("Default error")({response: {status: 401}});
            expect(ErrorDialog.showError).toHaveBeenCalledWith("Your session has expired. Please log in again.", null, expect.anything());
        });

        it('Should show an error on 403', () => {
            window.location.assign = jest.fn();
            ErrorDialog.showError = jest.fn();
            handleHttpError("Default error")({response: {status: 403}});
            expect(ErrorDialog.showError).toHaveBeenCalledWith("You have no access to this resource. Ask your administrator to grant you access.", null, expect.anything());
        });

        it('Should throw an exception with the backend error on responses other than 401', () => {
            expect(
                () => {
                    handleHttpError("Default error")({
                        response: {status: 500, data: 'Backend error'}
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
