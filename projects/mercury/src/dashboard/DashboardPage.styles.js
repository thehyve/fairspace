import {alpha} from '@mui/material/styles';

const styles = theme => ({
    mainPage: {
        marginTop: 10,
        width: '80%'
    },
    paperContent: {
        borderRadius: theme.shape.borderRadius,
        borderColor: theme.palette.primary.main,
        padding: '10px 20px 10px 20px',
        height: '100%'
    },
    link: {
        color: theme.palette.primary.light,
        textDecoration: 'underline'
    },
    header: {
        margin: 10
    },
    mainHeader: {
        paddingBottom: 40,
        paddingTop: 20
    },
    footer: {
        marginBottom: 0,
        paddingTop: 10
    },
    paragraph: {
        border: 2,
        borderRadius: theme.shape.borderRadius,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        padding: 10
    },
    textFieldWrapper: {
        padding: 20,
        alignItems: 'center'
    },
    textField: {
        border: 2,
        borderRadius: theme.shape.borderRadius,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.25),
            borderColor: theme.palette.primary.dark
        },
        color: theme.palette.primary.contrastText,
        width: '100%'
    }
});

export default styles;
