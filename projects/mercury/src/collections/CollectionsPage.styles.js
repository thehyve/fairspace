import * as consts from '../constants';

const styles = () => ({
    topBar: {
        marginBottom: 16,
        width: consts.MAIN_CONTENT_WIDTH
    },
    topBarSwitch: {
        paddingLeft: 8,
        textAlign: 'right',
        whiteSpace: 'nowrap'
    },
    metadataButton: {
        paddingRight: 8
    },
    centralPanel: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        paddingLeft: 0
    },
    sidePanel: {
        width: consts.SIDE_PANEL_WIDTH
    },
    endIcon: {
        position: 'absolute',
        right: '1rem'
    }
});

export default styles;
