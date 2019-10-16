import React, {useEffect} from "react";
import {renderHook} from "@testing-library/react-hooks";
import {act} from 'react-test-renderer';
import {MemoryRouter, useHistory} from "react-router-dom";

import useNavigationBlocker from "../UseNavigationBlocker";

const WrapperWithPushToHistory = ({children}) => {
    const history = useHistory();

    useEffect(() => history.push(), [history]);

    return children;
};

describe('UseFormSubmission', () => {
    it('sets event listener for beforeunload event when there are pending changes', () => {
        window.addEventListener = jest.fn();

        renderHook(() => useNavigationBlocker(true), {
            wrapper: ({children}) => <MemoryRouter>{children}</MemoryRouter>
        });

        expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.anything());
    });

    it('does not set event listener for beforeunload event when there are no pending changes', () => {
        window.addEventListener = jest.fn();

        renderHook(() => useNavigationBlocker(false), {
            wrapper: ({children}) => <MemoryRouter>{children}</MemoryRouter>
        });

        expect(window.addEventListener).not.toHaveBeenCalledWith('beforeunload', expect.anything());
    });

    it('returns showCloseConfirmation as true when there are pending changes', () => {
        const {result} = renderHook(() => useNavigationBlocker(true), {
            wrapper: ({children}) => (
                <MemoryRouter>
                    <WrapperWithPushToHistory>
                        {children}
                    </WrapperWithPushToHistory>
                </MemoryRouter>
            )
        });

        expect(result.current.showCloseConfirmation).toBe(true);
    });

    it('changes showCloseConfirmation to false after "executeNavigation"', () => {
        const {result} = renderHook(() => useNavigationBlocker(true), {
            wrapper: ({children}) => (
                <MemoryRouter>
                    <WrapperWithPushToHistory>
                        {children}
                    </WrapperWithPushToHistory>
                </MemoryRouter>
            )
        });

        expect(result.current.showCloseConfirmation).toBe(true);

        act(() => {
            result.current.executeNavigation();
        });

        expect(result.current.showCloseConfirmation).toBe(false);
    });
});
