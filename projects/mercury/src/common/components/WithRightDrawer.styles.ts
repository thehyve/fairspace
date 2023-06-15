// @ts-nocheck
const drawerWidth = 360;

const styles = theme => ({
  drawerContents: {
    marginTop: 50
  },
  content: {
    flexGrow: 1,
    paddingRight: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginRight: 0
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginRight: drawerWidth + 3 * theme.spacing(1),
    minWidth: drawerWidth
  },
  infoDrawerPaper: {
    width: drawerWidth,
    padding: theme.spacing(3)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.mixins.toolbar.minHeight + 3 * theme.spacing(1)
  },
  toolbar: theme.mixins.toolbar
});

export default styles;