export const mockResponse = (response, status = 200, statusText = 'OK', headers = {'Content-type': 'application/json'}) => {
    return new window.Response(response, {
        status,
        statusText,
        headers
    });
};

export const testNoChangedOnUnknownActionType = (description, reducer) => {
    describe(description, () => {
        it('should return the same state unchanged if action type is unknown by reducer', () => {
            const state = {'say what?': 'you can not touch this'};
            expect(reducer(state, {
                type: 'ACTION_THAT_DOES_NOT_EXIST'
            })).toEqual({'say what?': 'you can not touch this'});
        });
    });
};
