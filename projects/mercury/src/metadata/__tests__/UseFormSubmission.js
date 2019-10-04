import {renderHook} from "@testing-library/react-hooks";
import {act} from 'react-test-renderer';

import {useFormSubmission} from "../UseFormSubmission";

describe('UseFormSubmission', () => {
    it('should call the submit function when the form is submitted', async () => {
        const submitFunc = jest.fn(() => Promise.resolve());
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc));

        expect(submitFunc.mock.calls.length).toEqual(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(submitFunc.mock.calls.length).toEqual(1);
    });

    it('should show the custom error component for validation errors (error with details object)', async () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        const submitFunc = jest.fn(() => Promise.reject({details: {}}));
        const errorDialogMock = {
            showError: jest.fn(),
            renderError: jest.fn()
        };
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));

        expect(errorDialogMock.showError.mock.calls.length).toEqual(0);
        expect(errorDialogMock.renderError.mock.calls.length).toEqual(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(errorDialogMock.showError.mock.calls.length).toEqual(0);
        expect(errorDialogMock.renderError.mock.calls.length).toEqual(1);
    });

    it('should show the default error component for general errors', async () => {
        const submitFunc = jest.fn(() => Promise.reject(new Error()));
        const errorDialogMock = {
            showError: jest.fn(),
            renderError: jest.fn()
        };
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));

        expect(errorDialogMock.showError.mock.calls.length).toEqual(0);
        expect(errorDialogMock.renderError.mock.calls.length).toEqual(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(errorDialogMock.renderError.mock.calls.length).toEqual(0);
        expect(errorDialogMock.showError.mock.calls.length).toEqual(1);
    });
});
