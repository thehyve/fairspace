// @ts-nocheck
const styles = () => ({
    root: {
        'width': '100%',
        'maxHeight': 'calc(100% - 60px)',
        'overflowX': 'auto',
        '-webkit-touch-callout': 'none',

        /* iOS Safari */
        '-webkit-user-select': 'none',

        /* Safari */
        '-khtml-user-select': 'none',

        /* Konqueror HTML */
        '-moz-user-select': 'none',

        /* Firefox */
        '-ms-user-select': 'none',

        /* Internet Explorer/Edge */
        'user-select': 'none'
        /* Non-prefixed version, currently supported by Chrome and Opera */

    },
    deletedFileRow: {
        opacity: "0.4"
    },
    headerCell: {
        paddingBottom: 8,
        verticalAlign: "top"
    }
});

export default styles;