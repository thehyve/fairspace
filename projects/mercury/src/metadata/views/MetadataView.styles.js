const CENTRAL_PANEL_WIDTH = '70%';
const RIGHT_PANEL_WIDTH = '30%';

const styles = theme => ({
    facets: {
        marginTop: 10,
        paddingBottom: 10,
        minWidth: 280,
        maxHeight: 'calc(100vh - 210px)',
        overflowY: 'auto'
    },
    centralPanel: {
        width: CENTRAL_PANEL_WIDTH,
        overflowX: 'auto'
    },
    centralPanelFullWidth: {
        width: '100%'
    },
    sidePanel: {
        width: RIGHT_PANEL_WIDTH
    },
    metadataViewTabs: {
        marginTop: 10,
        overflowX: 'auto',
        width: '100%',
        overflowY: 'hidden',
        maxHeight: 'calc(100vh - 210px)',
    },
    clearAllButtonContainer: {
        textAlign: 'end'
    },
    clearAllButton: {
        color: theme.palette.error.main
    }
});

export default styles;
