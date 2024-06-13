import {alpha} from '@mui/material/styles';

const styles = theme => ({
    paper: {
        width: '160px',
        height: '100px',
        border: 'none',
        background: theme.palette.primary.dark,
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.dark, 0.5)
        },
        textAlign: 'center'
    },
    outerMargin: {
        margin: 10
    },
    icon: {
        marginLeft: 10,
        marginTop: 10
    },
    imageIconRoot: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 'xx-large'
    },
    imageIcon: {
        display: 'flex',
        height: 'inherit',
        width: 'inherit'
    },
    domainText: {
        color: theme.palette.primary.contrastText,
        paddingTop: 10
    },
    link: {
        textDecoration: 'none'
    }
});

export default styles;
