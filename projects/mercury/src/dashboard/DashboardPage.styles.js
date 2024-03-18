import * as consts from '../constants';

const styles = theme => ({
    mainPage: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxWidth: '700px',
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        padding: 20,
        marginTop: 20
    },
    header: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        marginBottom: 50
    },
    textRow: {
        minHeight: '250px'
    },
    customFont: {
        fontFamily: 'sans-serif'
    }
});

export default styles;
