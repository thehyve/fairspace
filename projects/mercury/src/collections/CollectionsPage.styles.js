import * as consts from '../constants';

const styles = () => ({
    topBar: {
        marginBottom: 16,
        width: consts.MAIN_CONTENT_WIDTH,
    },
    topBarSwitch: {
        textAlign: 'right',
        whiteSpace: 'nowrap',
    },
    centralPanel: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
    },
    sidePanel: {
        width: consts.SIDE_PANEL_WIDTH,
    },
    endIcon: {
        position: 'absolute',
        right: '1rem',
    },
});

export default styles;
