import React from 'react';
import {createShallow} from '@material-ui/core/test-utils';
import {AlterPermissionDialog, styles} from "./AlterPermissionDialog";

describe('AlterPermissionDialog', () => {

    let shallow;
    const mockAlterPermissionFn = jest.fn();
    const mockfetchUsersFn = jest.fn();
    const mockUsers = {
        data: [
            {id: 'user1-id', firstName: 'Mariah', lastName: 'Carey'},
            {id: 'user2-id', firstName: 'Michael', lastName: 'Jackson'},
            {id: 'user3-id', firstName: 'Bruno', lastName: 'Mars'},
            {id: 'user4-id', firstName: 'Kurt', lastName: 'Cobain'},
            {id: 'user5-id', firstName: 'Ariana', lastName: 'Grande'},
        ]
    };
    const mockCollaborators = [
        {
            'collectionId': 500,
            'subject': 'user2-id',
            'access': 'Write'
        },
        {
            'collectionId': 500,
            'subject': 'user4-id',
            'access': 'Manage'
        }
    ];
    const mockCurrentLoggedUser = {
        id: 'user1-id'
    };
    const mockCollection = {
        "id": 500,
        "location": "Jan_Smit_s_collection-500",
        "name": "Jan Smit's collection 1",
        "description": "Jan Smit's collection, beyond the horizon 01",
        "uri": "https://workspace.ci.test.fairdev.app/iri/collections/500",
        "access": "Manage",
        "dateCreated": "2018-09-19T15:48:23.016165Z",
        "creator": "user4-id"
    };
    const mockUser = {
        'collectionId': 500,
        'subject': 'user2-id',
        'access': 'Write'
    };

    let wrapper;

    beforeAll(() => {
        shallow = createShallow({ dive: true });
    });

    it('should render initial state of the dialog correctly', () => {
        const expectedOptions = [
            {
                "disabled":true,
                "label":"Mariah Carey",
                "value":"user1-id"
            },
            {
                "disabled":true,
                "label":"Michael Jackson",
                "value":"user2-id"
            },
            {
                "disabled":false,
                "label":"Bruno Mars",
                "value":"user3-id"
            },
            {
                "disabled":true,
                "label":"Kurt Cobain",
                "value":"user4-id"
            },
            {
                "disabled":false,
                "label":"Ariana Grande",
                "value":"user5-id"
            }
        ];

        wrapper = shallow(<AlterPermissionDialog
            open={false}
            classes={styles}
            user={null}
            collection={mockCollection}
            collaborators={mockCollaborators}
            currentLoggedUser={mockCurrentLoggedUser}

            fetchUsers={mockfetchUsersFn}
            alterPermission={mockAlterPermissionFn}
            users={mockUsers}
        />);

        // initial state if it's open or not
        expect(wrapper.find('Dialog').prop('open')).toBeFalsy();

        // title =Share with
        expect(wrapper.find('WithStyles(DialogTitle)').childAt(0).text()).toEqual('Share with');

        // render collacborator selector
        expect(wrapper.find('WithStyles(MaterialReactSelect)').prop('value')).toBe(null);
        expect(wrapper.find('WithStyles(MaterialReactSelect)').prop('options')).toEqual(expectedOptions);

        // initial value of the access right is "Read"
        expect(wrapper.find('RadioGroup').prop('value')).toEqual('Read');
        // populate radio group with 3 access options
        expect(wrapper.find('RadioGroup').childAt(0).prop('value')).toEqual('Read');
        expect(wrapper.find('RadioGroup').childAt(1).prop('value')).toEqual('Write');
        expect(wrapper.find('RadioGroup').childAt(2).prop('value')).toEqual('Manage');

        // render cancel and submit buttons
        expect(wrapper.find('WithStyles(Button)').at(0).childAt(0).text()).toEqual('Cancel');
        expect(wrapper.find('WithStyles(Button)').at(1).childAt(0).text()).toEqual('Submit');
        expect(wrapper.find('WithStyles(Button)').at(1).prop('disabled')).toBeTruthy();
    });

    it('should not render user selector and render selected user fullname instead when user is provided', () => {
        wrapper = shallow(<AlterPermissionDialog
            open={false}
            classes={styles}
            user={mockUser}
            collection={mockCollection}
            collaborators={mockCollaborators}
            currentLoggedUser={mockCurrentLoggedUser}

            fetchUsers={mockfetchUsersFn}
            alterPermission={mockAlterPermissionFn}
            users={mockUsers}
        />);
        expect(wrapper.find('WithStyles(MaterialReactSelect)')).toHaveLength(0);
        expect(wrapper.find('WithStyles(Typography)').childAt(0).text()).toEqual('Michael Jackson');
    });

    // TODO: Add more tests on behaviour changes
});
