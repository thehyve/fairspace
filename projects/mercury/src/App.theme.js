import {createMuiTheme} from "@material-ui/core";
import {blue, indigo, pink} from '@material-ui/core/colors';

export default createMuiTheme({
    palette: {
        primary: process.env.NODE_ENV === 'development' ? blue : indigo,
        secondary: pink
    },
    props: {
        MuiMenu: {
            elevation: 1
        }
    },
});
