import { createTheme, adaptV4Theme } from "@mui/material";
import {blue, indigo, pink} from '@mui/material/colors';

export default createTheme(adaptV4Theme({
    palette: {
        primary: process.env.NODE_ENV === 'development' ? blue : indigo,
        secondary: pink
    },
    props: {
        MuiMenu: {
            elevation: 1
        }
    },
}));
