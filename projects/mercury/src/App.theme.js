import {createTheme} from "@material-ui/core";
import {blue, indigo, pink} from '@material-ui/core/colors';

export default createTheme({
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
