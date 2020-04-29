import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router-dom";

import UserContext from "../../common/contexts/UserContext";
import Layout from "../Layout";
import MenuDrawer from "../MenuDrawer";

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
});
