import {handleHttpError} from "../httpUtils";

describe('Http Utils', () => {
    describe('handleHttpError', () => {
        it('Should redirect to the login page on 401 and throw exception', () => {
            window.location.assign = jest.fn();
            expect(() => handleHttpError("Default error")({ok: false, status: 401})).toThrow();
            expect(window.location.assign).toHaveBeenCalledWith('/login?redirectUrl=http://localhost/');
        });

        it('Should throw an exception with the backend error on responses other than 401', () => {
            expect(
                () => {
                    handleHttpError("Default error")({
                        ok: false,
                        status: 500,
                        message: 'Backend error'
                    });
                }
            ).toThrow(new Error('Backend error'));
        });
    });
});
