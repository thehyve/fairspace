import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";

describe('FileOperations', () => {
    it('should disable all buttons on when file operation is not finished yet', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            selectedPaths={['a']}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        const handlePaste = wrapper.find('[aria-label="Paste"]').prop("onClick");
        handlePaste({stopPropagation: () => {}});

        wrapper.find(IconButton)
            .forEach(b => {
                expect(b.props().disabled).toBe(true);
            });
    });

    it('should enable all buttons after successful file operation', () => {
        const wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            selectedPaths={['a']}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        const handlePaste = wrapper.find('[aria-label="Paste"]').prop("onClick");
        return handlePaste({stopPropagation: () => {}})
            .then(() => {
                wrapper.find(IconButton)
                    .not('[download]')
                    .forEach(b => {
                        expect(b.props().disabled).toBe(false);
                    });
            });
    });
});
