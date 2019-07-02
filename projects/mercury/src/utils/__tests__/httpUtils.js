import failOnHttpError from "../httpUtils";

describe('Http Utils', () => {
    describe('failOnHttpError', () => {
        it('Should pass through valid responses', () => {
            expect(failOnHttpError("Default error")({ok: true, status: 200}))
                .toEqual({ok: true, status: 200});
        });

        it('Should redirect to the login page on 401 and throw exception', () => {
            window.location.assign = jest.fn();
            expect(() => failOnHttpError("Default error")({ok: false, status: 401})).toThrow();
            expect(window.location.assign).toHaveBeenCalledWith('/login?redirectUrl=http://localhost/');
        });

        it('Should throw an exception with the backend error on responses other than 401',
            () => expect(failOnHttpError("Default error")({
                ok: false,
                status: 500,
                json: () => Promise.resolve({message: 'Backend error'})
            })).rejects.toEqual(new Error('Backend error')));

        it('Should reject the promise on non-JSON response',
            () => expect(failOnHttpError("Default error")({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error("Parsing error"))
            })).rejects.toEqual(new Error('Default error')));
    });
});
