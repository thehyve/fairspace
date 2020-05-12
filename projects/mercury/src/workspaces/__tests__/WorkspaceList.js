import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import WorkspaceList from '../WorkspaceList';
import type {Workspace} from '../WorkspacesAPI';

describe('WorkspaceList', () => {
    it('shows message when no workspaces are available', () => {
        const {getByText} = render(<MemoryRouter><WorkspaceList /></MemoryRouter>);
        expect(getByText(/Please create a workspace/i))
            .toBeInTheDocument();
    });

    it('displays the list of workspaces', () => {
        const workspaces: Workspace[] = [{
            id: 'workspace1', name: 'workspace-1', status: 'Active'
        }, {
            id: 'workspace2', name: 'workspace-2', status: 'Active'
        }];
        const {getByText} = render(<MemoryRouter><WorkspaceList workspaces={workspaces} /></MemoryRouter>);
        expect(getByText('Id'))
            .toBeInTheDocument();
        expect(getByText('workspace-1'))
            .toBeInTheDocument();
        expect(getByText('workspace-2'))
            .toBeInTheDocument();
    });
});
