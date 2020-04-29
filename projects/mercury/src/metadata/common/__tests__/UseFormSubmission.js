import {renderHook} from "@testing-library/react-hooks";
import {act} from 'react-test-renderer';

import {useFormSubmission} from "../UseFormSubmission";
import ValidationErrorsDisplay from '../ValidationErrorsDisplay';

describe('UseFormSubmission', () => {
    it('should call the submit function when the form is submitted', async () => {
        const submitFunc = jest.fn(() => Promise.resolve());
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc));

        expect(submitFunc).toHaveBeenCalledTimes(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(submitFunc).toHaveBeenCalledTimes(1);
    });

    it('should show the custom error component for validation errors (error with details object)', async () => {
        // eslint-disable-next-line prefer-promise-reject-errors
        const submitFunc = jest.fn(() => Promise.reject({details: {}}));
        const errorDialogMock = {
            showError: jest.fn(),
            renderError: jest.fn()
        };
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));

        expect(errorDialogMock.showError).toHaveBeenCalledTimes(0);
        expect(errorDialogMock.renderError).toHaveBeenCalledTimes(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(errorDialogMock.showError).toHaveBeenCalledTimes(0);
        expect(errorDialogMock.renderError).toHaveBeenCalledTimes(1);
    });

    it('should show the default error component for general errors', async () => {
        const submitFunc = jest.fn(() => Promise.reject(new Error()));
        const errorDialogMock = {
            showError: jest.fn(),
            renderError: jest.fn()
        };
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));

        expect(errorDialogMock.showError).toHaveBeenCalledTimes(0);
        expect(errorDialogMock.renderError).toHaveBeenCalledTimes(0);

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(errorDialogMock.showError).toHaveBeenCalledTimes(1);
        expect(errorDialogMock.renderError).toHaveBeenCalledTimes(0);
    });

    it('should render validation errors IRIs with namespaces', async () => {
        const namespaces = [
            {
                namespace: 'http://fairspace.io/',
                prefix: 'fs'
            }
        ];
        const details = [
            {
                message: "Cannot add a machine-only property",
                subject: "http://fairspace.io/ontology#collectionTypeShape",
                predicate: "http://fairspace.io/ontology#domainIncludes",
                value: "http://workspace.ci.fairway.app/vocabulary/AnalysisShape"
            }
        ];

        // eslint-disable-next-line prefer-promise-reject-errors
        const submitFunc = jest.fn(() => Promise.reject({details, message: 'Validation Error'}));
        const renderError = jest.fn();
        const {result, waitForNextUpdate} = renderHook(() => useFormSubmission(submitFunc, '', namespaces, {renderError}));

        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();

        expect(renderError).toHaveBeenCalledWith(
            ValidationErrorsDisplay,
            {
                entityErrors: [],
                otherErrors:
                    [{
                        message: "Cannot add a machine-only property",
                        predicate: "fs:ontology#domainIncludes",
                        subject: "fs:ontology#collectionTypeShape",
                        value: "http://workspace.ci.fairway.app/vocabulary/AnalysisShape"
                    }]
            },
            'Validation Error'
        );
    });
});
