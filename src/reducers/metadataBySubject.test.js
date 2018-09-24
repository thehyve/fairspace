import reducer from "./metadataBySubject"

describe('metadata retrieval', () => {
    it('should store pending state per subject', () => {
        const previousState = {'previous-subject': 'test'};
        const action = {
            type: 'METADATA_PENDING',
            meta: { subject: 'my-subject' }
        };

        const newState = reducer(previousState, action)

        expect(newState['previous-subject']).toEqual('test');
        expect(newState['my-subject'].pending).toEqual(true);
    })

    it('should store retrieved metadata per subject', () => {
        const previousState = {'previous-subject': 'test'};
        const action = {
            type: 'METADATA_FULFILLED',
            meta: { subject: 'my-subject' },
            payload: 'new-metadata'
        };

        const newState = reducer(previousState, action)

        expect(newState['previous-subject']).toEqual('test');
        expect(newState['my-subject'].pending).toEqual(false);
        expect(newState['my-subject'].items).toEqual('new-metadata');
    })

    it('should store errors per subject', () => {
        const previousState = {'previous-subject': 'test'};
        const action = {
            type: 'METADATA_REJECTED',
            meta: { subject: 'my-subject' },
            payload: new Error('new-metadata')
        };

        const newState = reducer(previousState, action)

        expect(newState['previous-subject']).toEqual('test');
        expect(newState['my-subject'].pending).toEqual(false);
        expect(newState['my-subject'].error).toEqual(new Error('new-metadata'));
    })
});

describe('metadata invalidation', () => {
    it('should invalidate subject metadata', () => {
        const previousState = {'previous-subject': 'test'};
        const action = {
            type: 'INVALIDATE_METADATA',
            subject: 'my-subject'
        };

        const newState = reducer(previousState, action)

        expect(newState['previous-subject']).toEqual('test');
        expect(newState['my-subject']).toBeNull();
    })
})
