// @ts-nocheck
import {renderHook} from "@testing-library/react-hooks";
import {act} from "react-test-renderer";
import React from "react";
import {useFormSubmission} from "../UseFormSubmission";
import ValidationErrorsDisplay from "../ValidationErrorsDisplay";
// same as UseLinkedData
// react-hooks for react 18 is in progress, will soon be finished: https://www.npmjs.com/package/@testing-library/react-hooks
describe.skip('UseFormSubmission', () => {
    it('should call the submit function when the form is submitted', async () => {
        const submitFunc = jest.fn(() => Promise.resolve());
        const {
            result,
            waitForNextUpdate
        } = renderHook(() => useFormSubmission(submitFunc));
        expect(submitFunc).toHaveBeenCalledTimes(0);
        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();
        expect(submitFunc).toHaveBeenCalledTimes(1);
    });
    it('should show the custom error component for validation errors (error with details object)', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
        const submitFunc = jest.fn(() => Promise.reject({
            details: {}
        }));
        const errorDialogMock = {
            showError: jest.fn()
        };
        const {
            result,
            waitForNextUpdate
        } = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));
        expect(errorDialogMock.showError).toHaveBeenCalledTimes(0);
        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();
        expect(errorDialogMock.showError).toHaveBeenCalledTimes(1);
    });
    it('should show the default error component for general errors', async () => {
        const submitFunc = jest.fn(() => Promise.reject(new Error()));
        const errorDialogMock = {
            showError: jest.fn()
        };
        const {
            result,
            waitForNextUpdate
        } = renderHook(() => useFormSubmission(submitFunc, '', [], errorDialogMock));
        expect(errorDialogMock.showError).toHaveBeenCalledTimes(0);
        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();
        expect(errorDialogMock.showError).toHaveBeenCalledTimes(1);
    });
    it('should render validation errors IRIs with namespaces', async () => {
        const namespaces = [{
            namespace: 'https://fairspace.nl/',
            prefix: 'fs'
        }];
        const details = [{
            message: "Cannot add a machine-only property",
            subject: "https://fairspace.nl/ontology#collectionTypeShape",
            predicate: "https://fairspace.nl/ontology#domainIncludes",
            value: "http://workspace.ci.fairway.app/vocabulary/AnalysisShape"
        }];
        // eslint-disable-next-line prefer-promise-reject-errors
        const submitFunc = jest.fn(() => Promise.reject({
            details,
            message: 'Validation Error'
        }));
        const showError = jest.fn();
        const {
            result,
            waitForNextUpdate
        } = renderHook(() => useFormSubmission(submitFunc, '', namespaces, {
            showError
        }));
        act(() => {
            result.current.submitForm();
        });
        await waitForNextUpdate();
        expect(showError).toHaveBeenCalledWith(<ValidationErrorsDisplay entityErrors={[]} otherErrors={[{
            message: "Cannot add a machine-only property",
            predicate: "fs:ontology#domainIncludes",
            subject: "fs:ontology#collectionTypeShape",
            value: "http://workspace.ci.fairway.app/vocabulary/AnalysisShape"
        }]} />);
    });
});