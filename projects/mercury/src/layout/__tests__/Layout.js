import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router-dom";

import UserContext from "../../users/UserContext";
import Layout from "../Layout";
import MenuDrawer from "../MenuDrawer";
import StatusAlert from "../../status/StatusAlert";
import StatusContext from "../../status/StatusContext";

describe('Layout', () => {
    const wrap = (element, availableAuthorizations = []) => (
        <UserContext.Provider value={{currentUser: {roles: availableAuthorizations}}}>
            <MemoryRouter>
                {element}
            </MemoryRouter>
        </UserContext.Provider>
    );

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const element = wrap(<Layout renderMenu={() => null} />);

        const div = document.createElement('div');

        ReactDOM.render(element, div);
        ReactDOM.unmountComponentAtNode(div);
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
            <StatusContext.Provider value={{serverStatus: "DOWN", userSessionStatus: 'OK'}}>
                <MemoryRouter>
                    <Layout renderMenu={() => null} />
                </MemoryRouter>
            </StatusContext.Provider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(1);
        const alertProps = wrapper.find(StatusAlert).first().props();
        expect(alertProps.children[0].props.children).toBe('A server-side error occurred.');
        expect(alertProps.children[1]).toBe(' Please try again later.');
    });

    it('should render alert if user session is not valid', () => {
        const element = (
            <StatusContext.Provider value={{serverStatus: "UP", userSessionStatus: ''}}>
                <MemoryRouter>
                    <Layout renderMenu={() => null} />
                </MemoryRouter>
            </StatusContext.Provider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(1);
        const alertProps = wrapper.find(StatusAlert).first().props();
        expect(alertProps.children[0].props.children).toBe('Current user session is no longer active.');
    });

    it('should not render alert if server is up and session is valid', () => {
        const element = (
            <StatusContext.Provider value={{serverStatus: "UP", userSessionStatus: 'OK'}}>
                <MemoryRouter>
                    <Layout renderMenu={() => null} />
                </MemoryRouter>
            </StatusContext.Provider>
        );

        const wrapper = mount(element);

        expect(wrapper.find(StatusAlert).length).toEqual(0);
    });
});
