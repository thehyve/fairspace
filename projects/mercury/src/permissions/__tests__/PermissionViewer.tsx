// @ts-nocheck
// @ts-nocheck
/* eslint-disable jest/expect-expect */
import React from "react";
import { configure, shallow } from "enzyme";
import { PermissionViewer } from "../PermissionViewer";
import UserPermissionsComponent from "../UserPermissionsComponent";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});

const testRenderingCollaborators = (wrapper, numberOfCollaborators) => {
  const permissionsListProps = wrapper.find(UserPermissionsComponent).first().props();
  expect(permissionsListProps.permissions.length).toBe(numberOfCollaborators);
};

const testOrderingOfCollaborators = wrapper => {
  const permissionsListProps = wrapper.find(UserPermissionsComponent).first().props();
  expect(permissionsListProps.permissions.map(p => p.iri)).toEqual(['http://localhost/iri/user4-id', 'http://localhost/iri/user3-id']);
};

describe('PermissionViewer', () => {
  const mockUsers = [{
    iri: 'http://localhost/iri/user2-id',
    access: 'Read',
    name: 'Michael Jackson'
  }, {
    iri: 'http://localhost/iri/user3-id',
    access: 'Read',
    name: 'Bruno Mars'
  }, {
    iri: 'http://localhost/iri/user1-id',
    access: 'Manage',
    name: 'Mariah Carey'
  }, {
    iri: 'http://localhost/iri/user4-id',
    access: 'Manage',
    name: 'Kurt Cobain'
  }];
  const mockCurrentUserCanManage = mockUsers[3];
  const mockCurrentUserCannotManage = mockUsers[1];
  const mockSetPermissionFn = jest.fn();
  const mockCollection = {
    iri: 'http://localhost/iri/c1',
    ownerWorkspace: 'http://localhost/iri/w1',
    access: 'Manage',
    canManage: true,
    userPermissions: [mockUsers[3], mockUsers[2], mockUsers[1], mockUsers[0]],
    workspacePermissions: []
  };
  const mockWorkspaceUsers = [mockUsers[3], mockUsers[1], mockUsers[0]];
  const mockCollaborators = [mockUsers[1], mockUsers[3]];
  const mockOwnerWorkspace = {
    iri: 'http://localhost/iri/w1'
  };
  const mockWorkspaces = [mockOwnerWorkspace, {
    iri: 'http://localhost/iri/w2'
  }];
  describe('Use Case 1: Current user can manage collection', () => {
    let wrapper;
    beforeAll(() => {
      wrapper = shallow(<PermissionViewer currentUser={mockCurrentUserCanManage} collection={mockCollection} collaboratingUsers={mockCollaborators} collaboratingWorkspaces={[]} workspaceUsers={mockWorkspaces} setPermission={mockSetPermissionFn} error={false} loading={false} />);
    });
    it('should render all collaborators', () => {
      testRenderingCollaborators(wrapper, 2);
    });
    it('should order permissions by the access rank (Manage-Write-Read)', () => {
      testOrderingOfCollaborators(wrapper);
    });
  });
  describe('Use Case 2: Current user cannot manage collection', () => {
    let wrapper;
    beforeAll(() => {
      wrapper = shallow(<PermissionViewer currentUser={mockCurrentUserCannotManage} collection={mockCollection} collaboratingUsers={mockCollaborators} collaboratingWorkspaces={[]} workspaceUsers={mockWorkspaceUsers} setPermission={mockSetPermissionFn} error={false} loading={false} />);
    });
    it('should render all collaborators', () => {
      testRenderingCollaborators(wrapper, 2);
    });
    it('should order permissions by the access rank (Manage-Write-Read)', () => {
      testOrderingOfCollaborators(wrapper);
    });
  });
  describe('Access to a collection is added to a new user', () => {
    let wrapper;
    beforeAll(() => {
      wrapper = shallow(<PermissionViewer currentUser={mockCurrentUserCanManage} collection={mockCollection} collaboratingUsers={[...mockCollaborators, mockUsers[0]]} collaboratingWorkspaces={[]} workspaceUsers={mockWorkspaceUsers} users={mockUsers} setPermission={mockSetPermissionFn} error={false} loading={false} />);
    });
    it('should render all collaborators', () => {
      testRenderingCollaborators(wrapper, 3);
    });
  });
  describe('Access to a collection is added to a workspace', () => {
    let wrapper;
    beforeAll(() => {
      wrapper = shallow(<PermissionViewer currentUser={mockCurrentUserCannotManage} collection={mockCollection} collaboratingUsers={[...mockCollaborators, mockOwnerWorkspace]} collaboratingWorkspaces={[{
        iri: 'http://localhost/iri/w2'
      }]} workspaceUsers={mockWorkspaceUsers} users={mockUsers} setPermission={mockSetPermissionFn} error={false} loading={false} />);
    });
    it('should render all collaborators', () => {
      testRenderingCollaborators(wrapper, 3);
    });
  });
});