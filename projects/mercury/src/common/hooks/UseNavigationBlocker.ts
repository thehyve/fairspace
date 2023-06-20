// @ts-nocheck
import {useEffect, useRef, useState} from "react";
import {useHistory} from "react-router-dom";

const UseNavigationBlocker = shouldBlock => {
    const history = useHistory();
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [locationToNavigateTo, setLocationToNavigateTo] = useState(null);
    // This effect is for handlng URL address manual changes
    useEffect(() => {
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    // This will show the default browser dialog,
    // there's no other way to stop navigation AND show custom dialog at the same time.
        const beforeunloadHandler = e => {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';
        };

        if (shouldBlock) {
            window.addEventListener('beforeunload', beforeunloadHandler);
        } else {
            window.removeEventListener('beforeunload', beforeunloadHandler);
        }

        return () => {
            window.removeEventListener('beforeunload', beforeunloadHandler);
        };
    }, [shouldBlock]);
    const unblockRef = useRef(null);
    // This effect for handling changes from the history/router within React
    useEffect(() => {
    // Avoid having multiple blocking prompts
        if (unblockRef.current) {
            unblockRef.current();
        }

        if (shouldBlock) {
            unblockRef.current = history.block(({
                pathname,
                search
            }) => {
                // If the confirmation is already shown and another navigation is fired then it should be allowed
                // The 2nd navigation can only be comming from the 'Navigate' confrimation button.
                if (showCloseConfirmation) {
                    return true;
                }

                setShowCloseConfirmation(true);
                setLocationToNavigateTo(pathname + (search || ''));
                return false;
            });
        }

        return () => {
            if (unblockRef.current) {
                unblockRef.current();
            }
        };
    }, [history, shouldBlock, showCloseConfirmation]);

    const executeNavigation = () => {
        if (locationToNavigateTo) {
            setShowCloseConfirmation(false);
            history.push(locationToNavigateTo);
        }
    };

    const hideConfirmation = () => {
        setShowCloseConfirmation(false);
    };

    const showConfirmation = () => {
        setShowCloseConfirmation(true);
    };

    return {
        confirmationShown: showCloseConfirmation,
        hideConfirmation,
        showConfirmation,
        executeNavigation
    };
};

export default UseNavigationBlocker;