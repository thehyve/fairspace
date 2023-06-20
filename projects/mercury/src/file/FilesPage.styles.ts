import * as consts from "../constants";

const styles = () => ({
    breadcrumbs: {
        position: 'relative',
        zIndex: 1
    },
    topBar: {
        marginBottom: 16,
        width: consts.MAIN_CONTENT_WIDTH
    },
    topBarSwitch: {
        textAlign: "right",
        whiteSpace: "nowrap"
    },
    centralPanel: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT
    },
    sidePanel: {
        width: consts.SIDE_PANEL_WIDTH
    }

});

export default styles;
