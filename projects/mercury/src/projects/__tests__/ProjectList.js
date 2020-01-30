import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import ProjectList from '../ProjectList';
import type {Project} from '../ProjectsAPI';

describe('ProjectList', () => {
    it('shows message when no projects are available', () => {
        const {getByText} = render(<MemoryRouter><ProjectList /></MemoryRouter>);
        expect(getByText(/Please create a project/i))
            .toBeInTheDocument();
    });

    it('displays the list of projects', () => {
        const projects: Project[] = [{
            name: 'project1', label: 'project-1'
        }, {
            name: 'project2', label: 'project-2'
        }];
        const {getByText} = render(<MemoryRouter><ProjectList projects={projects} /></MemoryRouter>);
        expect(getByText('Id'))
            .toBeInTheDocument();
        expect(getByText('project-1'))
            .toBeInTheDocument();
        expect(getByText('project-2'))
            .toBeInTheDocument();
    });
});
