import React from "react";

import {render, screen, waitFor} from '@testing-library/react';
import ExternalMetadataSourceView from '../ExternalMetadataSourceView';
import {ExternalMetadataSourceProvider} from "../ExternalMetadataSourceContext";
import useAsync from "../../../common/hooks/UseAsync";

jest.mock('axios');
jest.mock('../../../common/hooks/UseAsync', () => jest.fn());
jest.mock('../../views/MetadataView', () => ({pathPrefix}) => <div>{pathPrefix}</div>);

describe('ExternalMetadataSourceView', () => {
    it('renders MetadataView with proper path redirection', async () => {
        const mockMetadataSource = {
            name: 'example', path: '/example/path',
        };

        useAsync.mockReturnValue({
            data: [mockMetadataSource], error: null, loading: false, refresh: jest.fn(),
        });

        render(
            <ExternalMetadataSourceProvider>
                <ExternalMetadataSourceView match={{params: {source: 'example'}}} classes={{}} />
            </ExternalMetadataSourceProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('/metadata-sources/example')).toBeInTheDocument();
        });
    });
});
