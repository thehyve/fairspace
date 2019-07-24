import React from 'react';
import '@github/clipboard-copy-element';

/**
 * This component is a wrapper around the clipboard-copy web component
 *
 * @param children
 * @param onCopy    Event handler to be invoked when the value if copied
 * @param props     Additional props to be passed to clipboard-copy
 * @returns {*}
 * @constructor
 * @see https://reactjs.org/docs/web-components.html
 * @see https://github.com/github/clipboard-copy-element
 */
const ClipboardCopy = ({children, onCopy, ...props}) => {
    const ref = React.createRef();

    React.useLayoutEffect(() => {
        const {current} = ref;
        current.addEventListener('clipboard-copy', onCopy);

        // Remove listener on unmount
        return () => current.removeEventListener('clipboard-copy', onCopy);
    }, [ref, onCopy]);

    return (
        <clipboard-copy ref={ref} {...props}>{children}</clipboard-copy>
    );
};

export default ClipboardCopy;
