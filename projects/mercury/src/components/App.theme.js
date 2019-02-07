import {createMuiTheme} from "@material-ui/core";
import indigo from "@material-ui/core/colors/indigo";
import pink from "@material-ui/core/colors/pink";

export default createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        primary: indigo,
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
