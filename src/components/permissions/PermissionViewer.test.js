import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import { PermissionsViewer } from "./PermissionsViewer";

describe('PermissionViewer' , () => {

    let shallow, wrapper;

    beforeAll(() => {
        shallow = createShallow();
    });
    it('should work', () => {
        wrapper = shallow(<PermissionsViewer
            permissions={[]}
            alteredPermission={{}}
            collection={[]}
            fetchPermissions={jest.fn()}
        />);
        console.log(wrapper.debug())
    });
});