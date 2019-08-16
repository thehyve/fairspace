import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";

describe('FileOperations', () => {
    it('should disable all buttons on file operation', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        wrapper.instance().handlePaste({stopPropagation: () => {}});

        wrapper.find(IconButton)
            .forEach(b => {
                expect(b.props().disabled).toBe(true);
            });
    });

    it('should enable all buttons after successful file operation', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        return wrapper.instance().handlePaste({stopPropagation: () => {}})
            .then(() => {
                wrapper.find(IconButton)
                    .not('[download]')
                    .forEach(b => {
                        expect(b.props().disabled).toBe(false);
                    });
            });
    });
});
