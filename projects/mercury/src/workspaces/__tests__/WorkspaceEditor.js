import React from 'react';
import {render, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {act} from 'react-dom/test-utils';
import type {Workspace} from '../WorkspacesAPI';
import WorkspaceEditor from '../WorkspaceEditor';

describe('WorkspaceEditor', () => {
    let onSubmit;
    let utils;
    const node = {id: 'http://localhost:8080'};

    const enterValue = (label, value) => fireEvent.change(utils.getByTestId(label), {target: {value}});
    const enterName = (value) => enterValue('Name', value);

    const submit = () => fireEvent.submit(utils.getByTestId('form'));

    beforeEach(async () => {
        const nodeApi = {
            getNodes: jest.fn(() => Promise.resolve([node]))
        };
        const workspaces: Workspace[] = [{
            id: 'a1', node: node.id
        }, {
            id: 'a2', node: node.id
        }];
        onSubmit = jest.fn();
        await act(async () => {
            utils = render(<WorkspaceEditor
                onSubmit={onSubmit}
                workspaces={workspaces}
                getNodes={nodeApi.getNodes}
            />);
        });
    });
    afterEach(cleanup);

    it('should send all entered parameters to the creation method', () => {
        enterName('a');
        submit();
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit)
            .toHaveBeenCalledWith({
                name: 'a'
            });
    });

    it('should enable and disable submit button at proper times', () => {
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled');
        enterName('a');
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled', false);
    });

    it('should require an identifier', () => {
        submit();
        expect(onSubmit).toHaveBeenCalledTimes(0);
    });

    it('should require unique workspace id', () => {
        enterName('a1');
        expect(utils.getByTestId('submit-button')).toHaveProperty('disabled');
    });
});
