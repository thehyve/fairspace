import {useEffect, useRef, useState} from "react";
import {useHistory} from "react-router-dom";

const UseNavigationBlocker = (hasPendingChanges) => {
    const history = useHistory();
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [locationToNavigateTo, setLocationToNavigateTo] = useState(null);

    // This effect is for handlng URL address manual changes
    useEffect(() => {
        // Taken from: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
        // This will show the default browser dialog,
        // there's no other way to stop navigation AND show custom dialog at the same time.
        const beforeunloadHandler = (e) => {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';
        };

        if (hasPendingChanges) {
            window.addEventListener('beforeunload', beforeunloadHandler);
        } else {
            window.removeEventListener('beforeunload', beforeunloadHandler);
        }

        return () => {
            window.removeEventListener('beforeunload', beforeunloadHandler);
        };
    }, [hasPendingChanges]);

    const unblockRef = useRef(null);

    // This effect for handling changes from the history/router within React
    useEffect(() => {
        // Avoid having multiple blocking prompts
        if (unblockRef.current) {
            unblockRef.current();
        }

        if (hasPendingChanges) {
            unblockRef.current = history.block(({pathname}) => {
                // If the confirmation is already shown and another navigation is fired then it should be allowed
                // The 2nd navigation can only be comming from the 'Navigate' confrimation button.
                if (showCloseConfirmation) {
                    return true;
                }

                setShowCloseConfirmation(true);
                setLocationToNavigateTo(pathname);
                return false;
            });
        }

        return () => {
            if (unblockRef.current) {
                unblockRef.current();
            }
        };
    }, [history, hasPendingChanges, showCloseConfirmation]);

    const executeNavigation = () => {
        if (locationToNavigateTo) {
            setShowCloseConfirmation(false);
            history.push(locationToNavigateTo);
        }
    };

    return {
        showCloseConfirmation, setShowCloseConfirmation, executeNavigation
    };
};

export default UseNavigationBlocker;
