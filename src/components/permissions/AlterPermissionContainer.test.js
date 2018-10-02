import {
    getNoOptionMessage,
    transformUserToOptions
} from "./AlterPermissionContainer";

describe.skip('AlterPermissionContainer', () => {
    describe('transformUserToOptions', () => {
        const mockUsers = {
            data: [
                {id: 1, firstName: 'Mariah', lastName: 'Carey'},
                {id: 2, firstName: 'Michael', lastName: 'Jackson'}
            ]
        };
        it('should return empty array when there is no data', () => {
            const test = transformUserToOptions({data: []});
            expect(test.length).toBe(0);
        });
        it('should transform user data to [{label: string, value: any}', () => {
            const test = transformUserToOptions(mockUsers);
            const expected = [
                {label: 'Mariah Carey', value: 1},
                {label: 'Michael Jackson', value: 2},
            ];
            expect(test[0].label).toBe(expected[0].label);
            expect(test[0].value).toBe(expected[0].value);

            expect(test[1].label).toBe(expected[1].label);
            expect(test[1].value).toBe(expected[1].value);
        });
    });

    describe('getNoOptionMessage', () => {
        it('should return "No Options" when users is undefined', () => {
            const test = getNoOptionMessage();
            expect(test).toBe('No options');
        });
        it('should return "Loading .."  when users is pending', () => {
            const test = getNoOptionMessage({pending: true});
            expect(test).toBe('Loading ..');
        });
        it('should return "Error: Cannot fetch users."  when users is error', () => {
            const test = getNoOptionMessage({error: true});
            expect(test).toBe('Error: Cannot fetch users.');
        })
    });


});
