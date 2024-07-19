import {alpha} from '@mui/material/styles';

const styles = theme => ({
    values: {
        cursor: 'default',
        marginTop: 3,
        fontSize: '0.875rem',
        lineHeight: 1.43,
        letterSpacing: '0.01071em',
        '& .MuiInputBase-root': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.25),
                borderColor: theme.palette.primary.main
            }
        },
        '& input': {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em',
            overflow: 'hidden'
        },
        '& .MuiOutlinedInput-input': {
            borderRadius: theme.shape.borderRadius
        },
        '& textarea': {
            fontSize: '0.875rem',
            lineHeight: 1.43,
            letterSpacing: '0.01071em',
            borderRadius: theme.shape.borderRadius
        }
    },
    addValue: {
        marginTop: 10,
        padding: 3,
        borderColor: theme.palette.primary.main,
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.default,
        '& .MuiGrid-item': {
            paddingTop: 4,
            paddingBottom: 4
        }
    },
    addValueInput: {
        borderRadius: theme.shape.borderRadius
    }
});

export default styles;
