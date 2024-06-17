import React from 'react';
import {render} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import {ThemeProvider} from '@mui/material/styles';
import ServicesContext from '../../common/contexts/ServicesContext';
import UserContext from '../../users/UserContext';
import ExternalStoragesContext from '../../external-storage/ExternalStoragesContext';
import ExternalMetadataSourceContext from '../../metadata/metadata-sources/ExternalMetadataSourceContext';
import InternalMetadataSourceContext from '../../metadata/metadata-sources/InternalMetadataSourceContext';
import MetadataViewContext from '../../metadata/views/MetadataViewContext';
import MainMenu from '../MainMenu';
import {DEFAULT_METADATA_VIEW_MENU_LABEL} from '../../constants';
import theme from '../../App.theme';

describe('MainMenu', () => {
    const setup = (user, services, externalStorages, externalMetadataSources, internalMetadata, views) => {
        return render(
            <ThemeProvider theme={theme}>
                <Router>
                    <ServicesContext.Provider value={{services}}>
                        <UserContext.Provider value={{currentUser: user}}>
                            <ExternalStoragesContext.Provider value={{externalStorages}}>
                                <ExternalMetadataSourceContext.Provider value={{externalMetadataSources}}>
                                    <InternalMetadataSourceContext.Provider
                                        value={{
                                            internalMetadataIcon: internalMetadata.icon,
                                            internalMetadataLabel:
                                                internalMetadata.label || DEFAULT_METADATA_VIEW_MENU_LABEL
                                        }}
                                    >
                                        <MetadataViewContext.Provider value={{views}}>
                                            <MainMenu open />
                                        </MetadataViewContext.Provider>
                                    </InternalMetadataSourceContext.Provider>
                                </ExternalMetadataSourceContext.Provider>
                            </ExternalStoragesContext.Provider>
                        </UserContext.Provider>
                    </ServicesContext.Provider>
                </Router>
            </ThemeProvider>
        );
    };

    it('renders home, workspaces and collections for all users', () => {
        const {getByText} = setup({}, [], [], [], {}, []);
        expect(getByText('Home')).toBeInTheDocument();
        expect(getByText('Workspaces')).toBeInTheDocument();
        expect(getByText('Collections')).toBeInTheDocument();
    });

    it('renders external storages when provided', () => {
        const externalStorages = [
            {name: 'storage1', label: 'Storage 1'},
            {name: 'storage2', label: 'Storage 2'}
        ];
        const {getByText} = setup({}, [], externalStorages, [], {}, []);
        expect(getByText('Storage 1')).toBeInTheDocument();
        expect(getByText('Storage 2')).toBeInTheDocument();
    });

    it('renders metadata view when user can view public metadata and views are provided', () => {
        const user = {canViewPublicMetadata: true};
        const views = ['view1', 'view2'];
        const {getByText} = setup(user, [], [], [], {}, views);
        expect(getByText('Metadata')).toBeInTheDocument();
    });

    it('does not render metadata views when user cannot view public metadata', () => {
        const user = {canViewPublicMetadata: false};
        const views = ['view1', 'view2'];
        const {queryByText} = setup(user, [], [], [], {}, views);
        expect(queryByText('Metadata')).not.toBeInTheDocument();
    });

    it('renders external metadata sources when user can view public metadata and sources are provided', () => {
        const user = {canViewPublicMetadata: true};
        const externalMetadataSources = [
            {name: 'source1', label: 'Source 1', icon: 'icon1.svg'},
            {name: 'source2', label: 'Source 2'} // no icon
        ];
        const {getByText} = setup(user, [], [], externalMetadataSources, {}, []);
        expect(getByText('Source 1')).toBeInTheDocument();
        expect(getByText('Source 2')).toBeInTheDocument();
        const iconService1 = document.querySelector('img');
        expect(iconService1).toHaveAttribute('alt', 'source1');
        expect(iconService1).toHaveAttribute('src', 'icon1.svg');
        // default icon for source2
        expect(document.querySelector('[data-testid="SavedSearchIcon"]')).toBeInTheDocument();
    });

    it('renders users link when user is admin', () => {
        const user = {isAdmin: true};
        const {getByText} = setup(user, [], [], [], {}, []);
        expect(getByText('Users')).toBeInTheDocument();
    });

    it('does not render users link when user is not admin', () => {
        const user = {isAdmin: false};
        const {queryByText} = setup(user, [], [], [], {}, []);
        expect(queryByText('Users')).not.toBeInTheDocument();
    });

    it('renders services when provided', () => {
        const services = [
            {name: 'service1', url: 'http://service1.com', icon: 'icon1.svg'},
            {name: 'service2', url: 'http://service2.com'} // no icon
        ];
        const {getByText} = setup({}, services, [], [], {}, []);
        expect(getByText('service1')).toBeInTheDocument();
        expect(getByText('service2')).toBeInTheDocument();
        const iconService1 = document.querySelector('img');
        expect(iconService1).toHaveAttribute('alt', 'service1');
        expect(iconService1).toHaveAttribute('src', 'icon1.svg');
        // default icon for service2
        expect(document.querySelector('[data-testid="OpenInNewIcon"]')).toBeInTheDocument();
    });
});
