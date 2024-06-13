// import * as consts from '../constants';

const styles = theme => ({
    mainPage: {
        // maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        padding: 20,
        marginTop: 20,
        marginLeft: 20,
        width: '80%'
    },
    paperContent: {
        borderRadius: 30,
        border: 'none',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: 20
    },
    paperContentLight: {
        backgroundColor: theme.palette.primary.light
    },
    paperContentDark: {
        background: `linear-gradient(45deg, ${theme.palette.primary.light} 8%, ${theme.palette.primary.main} 40%, ${theme.palette.primary.dark} 76%)`
    },
    link: {
        color: theme.palette.primary.contrastText,
        textDecoration: 'underline'
    },
    header: {
        margin: 20
    },
    footer: {
        marginBottom: 0,
        paddingTop: 20
    },
    divider: {
        marginBottom: 30,
        background: theme.palette.primary.dark,
        borderBottomWidth: 5
    }
});

export default styles;
