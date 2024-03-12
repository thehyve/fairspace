// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { TextEncoder, TextDecoder } from 'util';

configure({ adapter: new Adapter() });

// TextEncoder and TextDecoder are not available anymore in the jest jsdom environment. They
// are available in all common browsers, therefor we can use them in tests without risk.
// https://github.com/inrupt/solid-client-authn-js/issues/1676
Object.assign(global, { TextDecoder, TextEncoder });
