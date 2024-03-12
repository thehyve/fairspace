import React from 'react';
import {act} from 'react-dom/test-utils';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
// eslint-disable-next-line jest/no-mocks-import
import '../__mocks__/clipboard.mock';
import CopyButton from "../CopyButton";

describe('<CopyButton />', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('changes the icon and title after copying', () => {
        render(<CopyButton
            labelPreCopy="Copy full IRI"
            labelAfterCopy="Copied!"
        />);

        const uncopiedIcon = screen.getByTestId('uncopied');
        expect(screen.getByLabelText(/Copy full IRI/i)).toBeInTheDocument();
        expect(uncopiedIcon).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tooltip'));

        const copiedIcon = screen.getByTestId('copied');
        expect(screen.getByLabelText(/Copied!/i)).toBeInTheDocument();
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
