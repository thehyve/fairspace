import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// eslint-disable-next-line jest/no-mocks-import
import '../__mocks__/clipboard.mock';
import CopyButton from "../CopyButton";

describe('<CopyButton />', () => {
    jest.useFakeTimers();

    it('changes the icon and title after copying', () => {
        const {getByTestId, getByTitle} = render(<CopyButton
            labelPreCopy="Copy full IRI"
            labelAfterCopy="Copied!"
        />);

        const uncopiedIcon = getByTestId('uncopied');

        expect(getByTitle(/Copy full IRI/i)).toBeInTheDocument();
        expect(uncopiedIcon).toBeInTheDocument();


        fireEvent.click(getByTestId('tooltip'));

        const copiedIcon = getByTestId('copied');
        expect(getByTitle(/Copied!/i)).toBeInTheDocument();
        expect(copiedIcon).toBeInTheDocument();
    });

    it('changes restores the original icon icon after some timeout', () => {
        const {getByTestId} = render(<CopyButton timeout={50} />);

        fireEvent.click(getByTestId('tooltip'));

        const copiedIcon = getByTestId('copied');
        expect(copiedIcon).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(100);
        });

        const uncopiedIcon = getByTestId('uncopied');
        expect(uncopiedIcon).toBeInTheDocument();
    });
});
