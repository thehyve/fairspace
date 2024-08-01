import React from 'react';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {ThemeProvider} from '@mui/material/styles';
import MetadataView from '../MetadataView';
import MetadataViewContext from '../MetadataViewContext';
import MetadataViewFacetsContext from '../MetadataViewFacetsContext';
import InternalMetadataSourceContext from '../../metadata-sources/InternalMetadataSourceContext';
import CollectionsContext from '../../../collections/CollectionsContext';
import FeaturesContext from '../../../common/contexts/FeaturesContext';
import theme from '../../../App.theme';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: jest.fn()
    })
}));

const mockMetadataViewContext = {
    views: [{title: 'view1', name: 'view1', columns: [{type: 'Identifier', name: 'view1'}]}],
    filters: [],
    loading: false,
    error: null
};

const mockMetadataViewFacetsContext = {
    facets: [],
    facetsLoading: false,
    facetsError: null,
    initialLoad: jest.fn()
};

const mockInternalMetadataSourceContext = {
    internalMetadataLabel: 'Test Metadata Label'
};

const mockCollectionsContext = {
    collections: []
};

const mockFeatureContext = {
    isFeatureEnabled: jest.fn()
};

describe('MetadataView', () => {
    const renderComponent = (props = {}) => {
        return render(
            <MemoryRouter>
                <FeaturesContext.Provider value={mockFeatureContext}>
                    <MetadataViewContext.Provider value={mockMetadataViewContext}>
                        <MetadataViewFacetsContext.Provider value={mockMetadataViewFacetsContext}>
                            <InternalMetadataSourceContext.Provider value={mockInternalMetadataSourceContext}>
                                <CollectionsContext.Provider value={mockCollectionsContext}>
                                    <ThemeProvider theme={theme}>
                                        <MetadataView classes={{}} {...props} />
                                    </ThemeProvider>
                                </CollectionsContext.Provider>
                            </InternalMetadataSourceContext.Provider>
                        </MetadataViewFacetsContext.Provider>
                    </MetadataViewContext.Provider>
                </FeaturesContext.Provider>
            </MemoryRouter>
        );
    };

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText('Test Metadata Label')).toBeInTheDocument();
    });

    it('displays views correctly', () => {
        renderComponent();
        expect(screen.getByText('view1')).toBeInTheDocument();
    });

    it('displays loading state correctly', () => {
        mockMetadataViewContext.loading = true;
        renderComponent();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('displays error state correctly', () => {
        mockMetadataViewContext.error = {message: 'Error loading data'};
        renderComponent();
        expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
});
