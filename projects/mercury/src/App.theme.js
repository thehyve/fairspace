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
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginTop: 4
                },
            },
            defaultProps: {
                size: "small",
                variant: "standard"
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    marginTop: 0,
                    padding: 0,
                    border: 0
                }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    margin: 0,
                    padding: 0
                }
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    margin: 0,
                    padding: 0,
                    border: 0
                }
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    marginTop: 15,
                    marginBottom: 0,
                    padding: 0,
                    border: 0
                }
            },
            defaultProps: {
                size: "small"
            }
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    // backgroundColor: "yellow",
                    margin: 0,
                    padding: 0,
                    border: 0
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    backgroundColor: "whitesmoke",
                    marginBotton: 0,
                    padding: 5
                }
            }
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: {
                    marginBottom: 18
                }
            }
        },
        MuiToolbar: {
            defaultProps: {
                variant: "dense"
            }
        }
    },
});
