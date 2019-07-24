/* eslint-disable import/no-extraneous-dependencies */
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

// Enable testing of components that use web components underneath
// Specifically used for '@github/clipboard-copy-element'
window.customElements = {
    get: () => true
};
