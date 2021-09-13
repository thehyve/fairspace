import {alpha} from '@material-ui/core/styles/colorManipulator';

const styles = theme => ({
    search: {
        'borderRadius': theme.shape.borderRadius,
        'backgroundColor': alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        'marginLeft': 0,
        'width': '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    adornedEnd: {
        paddingRight: theme.spacing(1)
    },
    searchIcon: {
        padding: 0
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        transition: theme.transitions.create('width'),
        width: '100%',
    },
});

export default styles;
