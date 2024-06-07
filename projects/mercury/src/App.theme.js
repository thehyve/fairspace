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
            main: '#758bfd'
        },
        error: pink,
        success: {
            main: '#08a045'
        },
        background: {
            default: '#eef0eb'
        },
        text: {
            primary: COLORS.fsBlueDark,
            secondary: COLORS.fsBlueMedium
        }
    },
    shape: {
        borderRadius: 15
    }
});

export const scrollbarStyles = {
    '&::-webkit-scrollbar': {
        width: '0.3em',
        height: '0.3em'
    },
    '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: globalTheme.palette.primary.light,
        outline: `1px solid ${globalTheme.palette.primary.light}`,
        borderRadius: 5
    }
};

export default createTheme({
    ...globalTheme,
    typography: {
        fontFamily: ['Sora', 'Palanquin'].join(','),
        fontSize: 13,
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
                    '&:hover': {
                        background: globalTheme.palette.primary.light
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
                    backgroundColor: globalTheme.palette.primary.dark,
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
        }
    }
});
