import {scrollbarStyles} from '../App.theme';
import {LEFT_PANEL_MAX_WIDTH} from '../constants';

const styles = theme => ({
    drawerPaper: {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: LEFT_PANEL_MAX_WIDTH,
        marginTop: '0',
        border: 'none',
        overflow: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        }),
        background: `radial-gradient(at right center, ${theme.palette.primary.main} 20%, ${theme.palette.primary.dark} 75%)`,
        height: '100vh'
    },
    drawerPaperOpen: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerPaperClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        width: 62
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 8px',
        marginTop: 'auto',
        marginBottom: 0,
        ...theme.mixins.toolbar
    },
    toolbarCollapsed: {
        display: 'flex',
        flexDirection: 'column',
        height: 80,
        alignItems: 'center',
        padding: '0 8px',
        marginTop: 'auto',
        marginBottom: 0,
        ...theme.mixins.toolbar
    },
    toolbarIcon: {
        color: 'white',
        marginLeft: 'auto'
    },
    mainLogo: {
        flexGrow: 1,
        textAlign: 'center',
        maxHeight: 140,
        marginTop: 60,
        marginBottom: 30
    },
    customerLogo: {
        position: 'absolute',
        bottom: 50,
        height: 100
    },
    menu: {
        overflowY: 'auto',
        ...scrollbarStyles
    }
});

export default styles;
