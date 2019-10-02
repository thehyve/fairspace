import React from 'react';
import {renderHook} from "@testing-library/react-hooks";
import {act} from 'react-test-renderer';

import {ErrorDialog} from "@fairspace/shared-frontend";
import {render} from "@testing-library/react";
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

    // it('should show the custom error component', () => {
    //     // eslint-disable-next-line prefer-promise-reject-errors
    //     const submitFunc = jest.fn(() => Promise.reject({details: {}}));

    //     const SubmitFormCmp = (props) => {
    //         const {submitForm} = useFormSubmission(submitFunc);
    //         // submitForm();
    //         return null;
    //     };

    //     const Cmp = (props) => (
    //         <ErrorDialog>
    //             <SubmitFormCmp />
    //         </ErrorDialog>
    //     );

    //     const {debug} = render(<Cmp />);

    //     debug();
    // });
});
