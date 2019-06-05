import failOnHttpError from "./httpUtils";

describe('Http Utils', () => {
    describe('failOnHttpError', () => {
        it('Should pass through valid responses', () => {
            expect(failOnHttpError("Error")({ok: true, status: 200}))
                .toEqual({ok: true, status: 200});
        });

        it('Should redirect to the login page on 401 and throw exception', () => {
            window.location.assign = jest.fn();
            expect(() => failOnHttpError("Error")({ok: false, status: 401})).toThrow();
            expect(window.location.assign).toHaveBeenCalledWith('/login?redirectUrl=http://localhost/');
        });

        it('Should throw an exception on error responses other than 401', () => {
            expect(() => failOnHttpError("Error")({ok: false, status: 500}))
                .toThrow(Error);
        });
    });
});
