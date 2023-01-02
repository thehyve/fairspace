import {createTheme} from "@mui/material";
import {blue, indigo, pink} from '@mui/material/colors';

export default createTheme({
    palette: {
        primary: process.env.NODE_ENV === 'development' ? blue : indigo,
        secondary: pink
    },
    components: {
        MuiMenu: {
            defaultProps: {
                elevation: 1
            },
        },
    },
});
