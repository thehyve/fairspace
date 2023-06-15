// @ts-nocheck
// @ts-nocheck
import React, { useEffect } from "react";
import { renderHook } from "@testing-library/react-hooks";
import { act } from "react-test-renderer";
import { MemoryRouter, useHistory } from "react-router-dom";
import useNavigationBlocker from "../UseNavigationBlocker";
describe.skip('UseFormSubmission', () => {
  it('sets event listener for beforeunload event when there are pending changes', () => {
    window.addEventListener = jest.fn();
    renderHook(() => useNavigationBlocker(true), {
      wrapper: ({
        children
      }) => <MemoryRouter>{children}</MemoryRouter>
    });
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.anything());
  });
  it('does not set event listener for beforeunload event when there are no pending changes', () => {
    window.addEventListener = jest.fn();
    renderHook(() => useNavigationBlocker(false), {
      wrapper: ({
        children
      }) => <MemoryRouter>{children}</MemoryRouter>
    });
    expect(window.addEventListener).not.toHaveBeenCalledWith('beforeunload', expect.anything());
  });
  it('returns confirmation shown as true when there are pending changes', () => {
    const {
      result
    } = renderHook(() => useNavigationBlocker(true), {
      wrapper: ({
        children
      }) => <MemoryRouter>
                    <WrapperWithPushToHistory>
                        {children}
                    </WrapperWithPushToHistory>
                </MemoryRouter>
    });
    expect(result.current.confirmationShown).toBe(true);
  });
  it('changes confirmation shown to false after "executeNavigation"', () => {
    const {
      result
    } = renderHook(() => useNavigationBlocker(true), {
      wrapper: ({
        children
      }) => <MemoryRouter>
                    <WrapperWithPushToHistory>
                        {children}
                    </WrapperWithPushToHistory>
                </MemoryRouter>
    });
    expect(result.current.confirmationShown).toBe(true);
    act(() => {
      result.current.executeNavigation();
    });
    expect(result.current.confirmationShown).toBe(false);
  });
});