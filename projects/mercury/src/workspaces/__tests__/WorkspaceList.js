import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import {ThemeProvider} from "@mui/material/styles";
import WorkspaceList from '../WorkspaceList';
import type {Workspace} from '../WorkspacesAPI';
import theme from "../../App.theme";

const wrap = (element) => (
    <MemoryRouter>
        <ThemeProvider theme={theme}>
            {element}
        </ThemeProvider>
    </MemoryRouter>
);

describe('WorkspaceList', () => {
    it('shows message when no workspaces are available', () => {
        const {getByText} = render(wrap(<WorkspaceList workspaces={[]} />));
        expect(getByText(/No workspaces available/i))
            .toBeInTheDocument();
    });

    it('displays the list of workspaces', () => {
        const workspaces: Workspace[] = [{
            id: 'workspace1', code: 'workspace-1', title: 'First workspace'
        }, {
            id: 'workspace2', code: 'workspace-2', title: 'Second workspace'
        }];
        const {getByText} = render(wrap(<WorkspaceList workspaces={workspaces} />));
        expect(getByText('Workspace'))
            .toBeInTheDocument();
        expect(getByText('workspace-1'))
            .toBeInTheDocument();
        expect(getByText('workspace-2'))
            .toBeInTheDocument();
    });
});
