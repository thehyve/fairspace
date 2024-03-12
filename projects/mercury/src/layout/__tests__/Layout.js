import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { MemoryRouter } from 'react-router-dom'; // for elements wrapped in 'withRouter'
import { ThemeProvider } from '@mui/material/styles';
import UserContext from '../../users/UserContext';
import Layout from '../Layout';
import MenuDrawer from '../MenuDrawer';
import StatusAlert from '../../status/StatusAlert';
import StatusContext from '../../status/StatusContext';
import theme from '../../App.theme';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({ adapter: new Adapter() });

describe('Layout', () => {
    const wrap = (element, availableAuthorizations = []) => (
        <ThemeProvider theme={theme}>
            <UserContext.Provider value={{ currentUser: { roles: availableAuthorizations } }}>
                <MemoryRouter>
                    {element}
                </MemoryRouter>
            </UserContext.Provider>
        </ThemeProvider>
    );

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const element = wrap(<Layout renderMenu={() => null} />);
        const div = document.createElement('div');
        const root = createRoot(div);
        root.render(element);
        root.unmount();
    });

    it('should render content if no required authorization is specified', () => {
        const element = wrap(<Layout renderMenu={() => null} />, ['test']);

        const wrapper = mount(element);

        expect(wrapper.find(MenuDrawer).length).toEqual(1);
    });

    it('should render alert if server status is undefined', () => {
        const element = wrap(<Layout renderMenu={() => null} />, ['test']);

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(1);
        const alertProps = wrapper.find(StatusAlert).first().props();
        expect(alertProps.children[0].props.children).toBe('A server-side error occurred.');
        expect(alertProps.children[1]).toBe(' Please try again later.');
    });

    it('should render alert if server is DOWN', () => {
        const element = (
            <ThemeProvider theme={theme}>
                <StatusContext.Provider value={{ serverStatus: 'DOWN', userSessionStatus: 'OK' }}>
                    <MemoryRouter>
                        <Layout renderMenu={() => null} />
                    </MemoryRouter>
                </StatusContext.Provider>
            </ThemeProvider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(1);
        const alertProps = wrapper.find(StatusAlert).first().props();
        expect(alertProps.children[0].props.children).toBe('A server-side error occurred.');
        expect(alertProps.children[1]).toBe(' Please try again later.');
    });

    it('should render alert if user session is not valid', () => {
        const element = (
            <ThemeProvider theme={theme}>
                <StatusContext.Provider value={{ serverStatus: 'UP', userSessionStatus: '' }}>
                    <MemoryRouter>
                        <Layout renderMenu={() => null} />
                    </MemoryRouter>
                </StatusContext.Provider>
            </ThemeProvider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(1);
        const alertProps = wrapper.find(StatusAlert).first().props();
        expect(alertProps.children[0].props.children).toBe('Current user session is no longer active.');
    });

    it('should not render alert if server is up and session is valid', () => {
        const element = (
            <ThemeProvider theme={theme}>
                <StatusContext.Provider value={{ serverStatus: 'UP', userSessionStatus: 'OK' }}>
                    <MemoryRouter>
                        <Layout renderMenu={() => null} />
                    </MemoryRouter>
                </StatusContext.Provider>
            </ThemeProvider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(0);
    });
});
