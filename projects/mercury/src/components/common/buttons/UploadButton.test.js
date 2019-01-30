import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import IconButton from "@material-ui/core/IconButton";

import UploadButton from './UploadButton';

describe('UploadButton', () => {
    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<UploadButton />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('should send properties to inner button', () => {
        const wrapper = mount(<UploadButton onUpload={() => {}} disabled />);
        expect(wrapper.find(IconButton).instance().props.disabled).toBe(true);
    });
});
