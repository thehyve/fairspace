import React from 'react';
import {render, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import type {Project} from '../ProjectsAPI';
import ProjectEditor from '../ProjectEditor';

describe('ProjectEditor', () => {

    let onSubmit;
    let utils;
    let workspace = {id: 'http://localhost:8080'};

    const enterValue = (label, value) => fireEvent.change(utils.getByTestId(label), {target: {value: value}});
    const enterWorkspace = (value) => enterValue('Workspace', value);
    const enterId = (value) => enterValue('Id', value);

    const submit = () => fireEvent.submit(utils.getByTestId('form'));

    beforeEach(() => {
        const workspaceApi = {
            getWorkspaces: jest.fn(() => Promise.resolve([workspace]))
        };
        const projects: Project[] = [{
            id: 'a1', workspace: workspace.id
        }, {
            id: 'a2', workspace: workspace.id
        }];
        onSubmit = jest.fn();
        utils = render(<ProjectEditor onSubmit={onSubmit} projects={projects} getWorkspaces={workspaceApi.getWorkspaces}/>);
    });

    afterEach(cleanup);

    it('should send all entered parameters to the creation method', () => {
        enterId('a');
        submit();
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit)
            .toHaveBeenCalledWith({
                workspace: workspace.id,
                id: 'a',
                title: 'a'
            });
    });

    it('should enable and disable submit button at proper times', () => {
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled');
        enterId('a');
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled', false);
    });

    it('should require an identifier', () => {
        enterWorkspace(workspace);
        submit();
        expect(onSubmit).toHaveBeenCalledTimes(0);
    });

    it('should require unique project id', () => {
        enterId('a1');
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled');
    });

});
