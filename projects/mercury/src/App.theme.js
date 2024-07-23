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
            dark: COLORS.fsBlueDark,
            contrastText: 'white'
        },
        secondary: {
            main: '#ffdb56',
            contrastText: 'black'
        },
        error: pink,
        success: {
            main: '#08a045'
        },
        background: {
            default: '#ECEDF0'
        },
        text: {
            primary: COLORS.fsBlueDark,
            secondary: COLORS.fsBlueMedium
        },
        mellow: {
            light: '#cfd8dc',
            main: '#b0bec5',
            dark: '#37474f',
            contrastText: '#47008F'
        }
    },
    shape: {
        borderRadius: 15
    }
});

export const scrollbarStyles = {
    '&::-webkit-scrollbar': {
        width: '0.5em',
        height: '0.5em'
    },
    '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        margin: 2
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: globalTheme.palette.mellow.light,
        borderRadius: 5,
        margin: 1
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: globalTheme.palette.mellow.main
    }
};

export default createTheme({
    ...globalTheme,
    typography: {
        fontFamily: 'Poppins',
        fontSize: 13,
        button: {
            textTransform: 'none'
        },
        h3: {
            fontSize: '1.4rem',
            fontWeight: 600
        },
        h4: {
            fontSize: '1.3rem',
            fontWeight: 600
        },
        h5: {
            fontSize: '1rem'
        },
        body2: {
            fontSize: '0.8rem'
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
                    margin: 0,
                    borderColor: globalTheme.palette.mellow.main
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
                    '&:hover': {
                        background: globalTheme.palette.primary.light
                    },
                    '&:disabled': {
                        opacity: 0.4,
                        color: globalTheme.palette.primary.contrastText,
                        background: globalTheme.palette.mellow.main
                    },
                    borderRadius: globalTheme.shape.borderRadius,
                    borderColor: globalTheme.palette.primary.light,
                    paddingBottom: 0,
                    paddingTop: 0,
                    minHeight: 35
                },
                text: {
                    color: globalTheme.palette.primary.contrastText
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    backgroundColor: globalTheme.palette.primary.main,
                    marginBottom: 0,
                    padding: 5
                },
                title: {
                    color: globalTheme.palette.primary.contrastText
                },
                avatar: {
                    color: globalTheme.palette.primary.contrastText
                },
                subheader: {
                    color: globalTheme.palette.primary.contrastText
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    borderRadius: globalTheme.shape.borderRadius
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
                    border: '1px solid',
                    borderColor: globalTheme.palette.primary.dark,
                    ...scrollbarStyles
                }
            }
        },
        MuiGrid: {
            styleOverrides: {
                root: {
                    ...scrollbarStyles
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    ...scrollbarStyles
                }
            }
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    ...scrollbarStyles
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid',
                    borderColor: globalTheme.palette.mellow.main
                }
            }
        }
    }
});
