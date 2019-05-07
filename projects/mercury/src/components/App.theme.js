import {createMuiTheme} from "@material-ui/core";
import indigo from "@material-ui/core/colors/indigo";
import pink from "@material-ui/core/colors/pink";
import blue from '@material-ui/core/colors/blue';

export default createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        primary: process.env.NODE_ENV === 'development' ? blue : indigo,
        secondary: pink
    },
    props: {
        MuiPaper: {
            square: true,
            elevation: 1
        },
        MuiMenu: {
            elevation: 2
        }
    }
});
