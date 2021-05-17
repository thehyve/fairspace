import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';

import {mount} from "enzyme";
import {TableRow} from "@material-ui/core";
import CollectionList from "../CollectionList";

describe('CollectionList', () => {
    it('shows warning message when no collections available', () => {
        const {getByText} = render(<CollectionList />);
        expect(getByText(/Please create a collection/i)).toBeInTheDocument();
    });

    it('renders correct header and values columns', () => {
        const collections = [{
            name: 'My Collection',
            creatorDisplayName: 'Mariah Carey',
            dateCreated: new Date().toUTCString(),
            iri: 'http://example.com/0',
            ownerWorkspace: 'http://example.com/ws1',
            ownerWorkspaceName: 'ws1'
        }];

        const {queryByText} = render(
            <CollectionList collections={collections} showDeleted={false} />
        );

        expect(queryByText('Name')).toBeInTheDocument();
        expect(queryByText('Creator')).toBeInTheDocument();
        expect(queryByText('Created')).toBeInTheDocument();
        expect(queryByText('Deleted')).not.toBeInTheDocument();
        expect(queryByText('My Collection')).toBeInTheDocument();
        expect(queryByText('Mariah Carey')).toBeInTheDocument();
        expect(queryByText('Workspace')).toBeInTheDocument();
        expect(queryByText('ws1')).toBeInTheDocument();
    });

    it('renders correct header and values columns in "show deleted" mode', () => {
        const collections = [{
            name: 'My Collection',
            creatorDisplayName: 'Mariah Carey',
            dateCreated: new Date().toUTCString(),
            iri: 'http://example.com/0',
            ownerWorkspace: 'http://example.com/ws1',
            ownerWorkspaceName: 'ws1',
            dateDeleted: new Date().toUTCString()
        }];

        const {getByText} = render(
            <CollectionList collections={collections} showDeleted />
        );

        expect(getByText('Name')).toBeInTheDocument();
        expect(getByText('Creator')).toBeInTheDocument();
        expect(getByText('Created')).toBeInTheDocument();
        expect(getByText('Deleted')).toBeInTheDocument();
        expect(getByText('My Collection')).toBeInTheDocument();
        expect(getByText('Mariah Carey')).toBeInTheDocument();
        expect(getByText('Workspace')).toBeInTheDocument();
        expect(getByText('ws1')).toBeInTheDocument();
    });

    it('filters collections by name on filter input change', () => {
        const collections = [
            {
                name: 'My Collection',
                creatorDisplayName: 'Mariah Carey',
                dateCreated: new Date().toUTCString(),
                iri: 'http://example.com/0',
                ownerWorkspace: 'http://example.com/ws1',
                ownerWorkspaceName: 'ws1',
                dateDeleted: new Date().toUTCString()
            },
            {
                name: 'Secret collection',
                creatorDisplayName: 'Mariah Carey',
                dateCreated: new Date().toUTCString(),
                iri: 'http://example.com/1',
                ownerWorkspace: 'http://example.com/ws1',
                ownerWorkspaceName: 'ws1',
                dateDeleted: new Date().toUTCString()
            }];

        const wrapper = mount(
            <CollectionList collections={collections} />
        );
        expect(wrapper.find(TableRow).length).toBe(3);

        const nameField = wrapper.find('input#filter').first();
        nameField.simulate('focus');
        nameField.simulate('change', {target: {value: 'SECRET'}});

        expect(wrapper.find(TableRow).length).toBe(2);
    });

    it('filters collections including description on filter input change', () => {
        const collections = [
            {
                name: 'My Collection',
                creatorDisplayName: 'Mariah Carey',
                dateCreated: new Date().toUTCString(),
                iri: 'http://example.com/0',
                ownerWorkspace: 'http://example.com/ws1',
                ownerWorkspaceName: 'ws1',
                dateDeleted: new Date().toUTCString(),
                description: "This one is not a secret"
            },
            {
                name: 'Secret collection',
                creatorDisplayName: 'Mariah Carey',
                dateCreated: new Date().toUTCString(),
                iri: 'http://example.com/1',
                ownerWorkspace: 'http://example.com/ws1',
                ownerWorkspaceName: 'ws1',
                dateDeleted: new Date().toUTCString()
            }];

        const wrapper = mount(
            <CollectionList collections={collections} />
        );
        expect(wrapper.find(TableRow).length).toBe(3);

        const nameField = wrapper.find('input#filter').first();
        nameField.simulate('focus');
        nameField.simulate('change', {target: {value: 'Sec'}});

        expect(wrapper.find(TableRow).length).toBe(3);
    });
});
