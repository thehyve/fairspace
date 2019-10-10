import React from 'react';
import {shallow} from "enzyme";
import {IconButton} from "@material-ui/core";

import {FileOperations} from "../FileOperations";

describe('FileOperations', () => {
    let wrapper;
    let handlePaste;

    beforeEach(() => {
        wrapper = shallow(<FileOperations
            classes={{}}
            paste={() => Promise.resolve()}
            selectedPaths={['a']}
            fetchFilesIfNeeded={() => {}}
            getDownloadLink={() => {}}
        />);

        handlePaste = wrapper.find('[aria-label="Paste"]').prop("onClick");
    });

    it('should disable all buttons on when file operation is not finished yet', () => {
        handlePaste({stopPropagation: () => {}});

        wrapper.find(IconButton)
            .forEach(b => {
                expect(b.props().disabled).toBe(true);
            });
    });

    // eslint-disable-next-line arrow-body-style
    it('should enable all buttons after successful file operation', () => {
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
