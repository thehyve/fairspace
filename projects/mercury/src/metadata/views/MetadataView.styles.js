const CENTRAL_PANEL_WIDTH = '70%';
const RIGHT_PANEL_WIDTH = '30%';

const styles = theme => ({
    leftPanel: {
        marginTop: 8,
        paddingBottom: 10,
        minWidth: 282
    },
    overallPanel: {
        width: CENTRAL_PANEL_WIDTH,
        overflowX: 'auto'
    },
    overallPanelFullWidth: {
        width: '100%'
    },
    rightPanel: {
        width: RIGHT_PANEL_WIDTH
    },
    centralPanel: {
        overflowX: 'auto',
        width: '100%',
        overflowY: 'hidden',
        maxHeight: 'calc(100vh - 150px)'
    },
    clearAllButtonContainer: {
        textAlign: 'end'
    },
    clearAllButton: {
        color: theme.palette.error.main
    },
    activeFilters: {
        marginBottom: 10
    }
});

export default styles;
