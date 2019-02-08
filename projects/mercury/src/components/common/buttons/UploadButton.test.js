import React from 'react';
import ReactDOM from 'react-dom';

import UploadButton from './UploadButton';

describe('UploadButton', () => {
    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<UploadButton />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
