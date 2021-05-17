import {fade} from "@material-ui/core/styles/colorManipulator";
import * as consts from "../../constants";

const CENTRAL_PANEL_WIDTH = '70%';
const RIGHT_PANEL_WIDTH = '30%';

const styles = theme => ({
    facet: {
        borderColor: theme.palette.primary.light,
        borderWidth: 1.5,
        borderRadius: 6
    },
    facets: {
        marginTop: 10,
        paddingBottom: 10,
        minWidth: 280,
        maxHeight: 'calc(100vh - 210px)',
        overflowY: 'auto'
    },
    centralPanel: {
        width: CENTRAL_PANEL_WIDTH,
        overflowX: 'auto',
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
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
    },
    tabsPanel: {
        paddingRight: 70
    },
    tab: {
        '& .MuiBox-root': {
            padding: 0,
        },
    },
    confirmFiltersButtonBlock: {
        bottom: 0,
        marginTop: 8,
        marginLeft: 4,
        width: 253
    },
    confirmFiltersButtonBlockActive: {
        position: 'sticky',
        backgroundColor: fade(theme.palette.common.white, 0.8)
    },
    confirmFiltersButton: {
        width: '100%'
    },
    clearAllButtonContainer: {
        textAlign: 'end'
    },
    clearAllButton: {
        color: theme.palette.error.main
    }
});

export default styles;
