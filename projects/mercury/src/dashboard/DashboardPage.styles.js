import * as consts from "../constants";

const styles = (theme) => ({
    mainPage: {
        width: consts.MAIN_CONTENT_WIDTH,
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        padding: 20,
    },
    header: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        marginBottom: 50,
    }
});

export default styles;
