import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router-dom";

import UserContext from "../../../contexts/UserContext";
import Layout from "../Layout";
import MenuDrawer from "../MenuDrawer";

describe('Layout', () => {
    const wrap = (element, availableAuthorizations = []) => (
        <UserContext.Provider value={{currentUser: {authorizations: availableAuthorizations}}}>
            <MemoryRouter>
                {element}
            </MemoryRouter>
        </UserContext.Provider>
    );

    // eslint-disable-next-line jest/expect-expect
    it('renders without crashing', () => {
        const element = wrap(<Layout />);

        const div = document.createElement('div');

        ReactDOM.render(element, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('should render content if no required authorization is specified', () => {
        const element = wrap(<Layout />, ['test']);

        const wrapper = mount(element);

        expect(wrapper.find(MenuDrawer).length).toEqual(1);
    });

    it('should render no content if user does not have required authorization ', () => {
        const element = wrap(<Layout requiredAuthorization="other-role" />, ['test']);

        const wrapper = mount(element);

        expect(wrapper.find(MenuDrawer).length).toEqual(0);
    });
});
