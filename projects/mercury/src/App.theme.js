import {createTheme} from '@mui/material';
import {pink} from '@mui/material/colors';

export const COLORS = {
    fsBlueLight: 'rgba(106,134,232,1)',
    fsBlueLightTransp25: 'rgba(106,134,232,0.25)',
    fsBlueMedium: 'rgba(63,102,177,1)',
    fsBlueDark: 'rgba(7, 59, 82, 1)'
};

const globalTheme = createTheme({
    palette: {
        primary: {
            main: COLORS.fsBlueMedium,
            light: COLORS.fsBlueLight,
            dark: COLORS.fsBlueDark
        },
        secondary: pink,
        background: {
            default: '#d9d9d9'
        }
    }
});

export default createTheme({
    ...globalTheme,
    typography: {
        button: {
            textTransform: 'none'
        }
    },
    components: {
        MuiMenu: {
            defaultProps: {
                elevation: 1
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginTop: 0
                }
            },
            defaultProps: {
                size: 'small',
                variant: 'standard'
            }
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    margin: 0
                },
                margin: 0
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    marginTop: 0,
                    padding: 5,
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
            }
        },
        MuiList: {
            styleOverrides: {
                root: {
                    margin: 0,
                    padding: 0,
                    border: 0
                }
            }
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    marginTop: 0,
                    marginBottom: 0,
                    paddingRight: 0,
                    border: 0
                }
            },
            defaultProps: {
                size: 'small'
            }
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    margin: 0,
                    padding: 0,
                    border: 0
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    margin: 0,
                    paddingBottom: 0,
                    border: 0
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    background: globalTheme.palette.primary.dark,
                    borderRadius: 15,
                    borderColor: globalTheme.palette.primary.light,
                    paddingBottom: 0,
                    paddingTop: 0,
                    minHeight: 35
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    backgroundColor: 'whitesmoke',
                    marginBottom: 0,
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
                variant: 'dense'
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                listbox: {
                    '& .MuiAutocomplete-option': {
                        display: 'block'
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: globalTheme.palette.background.default,
                    // borderRadius: 15,
                    border: '1px solid',
                    borderColor: globalTheme.palette.primary.dark
                }
            }
        },
        MuiBox: {
            styleOverrides: {
                root: {
                    borderRadius: 15
                }
            }
        }
    }
});
