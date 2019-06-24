import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import {emphasize} from '@material-ui/core/styles/colorManipulator';

const styles = theme => ({
    root: {},
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    chipFocused: {
        backgroundColor: emphasize(
            theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
            0.08,
        ),
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
});

function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function inputComponent({inputRef, ...props}) {
    return <div ref={inputRef} {...props} />;
}

function Control(props) {
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
}

function blockEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    if ((event.target.tagName !== 'A') || !('href' in event.target)) {
        return;
    }
    if (event.target.target) {
        window.open(event.target.href, event.target.target);
    } else {
        window.location.href = event.target.href;
    }
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
            disabled={!!props.data.disabled}
            onClick={props.data.disabled ? blockEvent : props.innerProps.onClick}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return (
        <div className={props.selectProps.classes.valueContainer}>
            {props.children}
        </div>
    );
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={classNames(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu(props) {
    return (
        <Paper className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

const materialReactSelect = (props) => {
    const {classes, theme} = props;

    const selectStyles = {
        input: base => ({
            ...base,
            color: theme.palette.text.primary,
        }),
        menuPortal: base => ({
            ...base,
            zIndex: 9999
        }),

    };

    return (
        <Select
            classes={classes}
            menuPortalTarget={document.body}
            styles={selectStyles}
            options={props.options}
            components={components}
            value={props.value}
            onChange={props.onChange}
            noOptionsMessage={props.noOptionsMessage}
            placeholder={props.placeholder}
            textFieldProps={{
                label: props.label,
                InputLabelProps: {
                    shrink: true,
                },
                onChange: props.onTextInputChange
            }}
        />
    );
};

const selectType = {disabled: PropTypes.bool, lavel: PropTypes.string, value: PropTypes.string};

materialReactSelect.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape(selectType)).isRequired,
    value: PropTypes.shape(selectType),
    placeholder: PropTypes.string,
    classes: PropTypes.shape(),
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
};

materialReactSelect.defaultProps = {
    placeholder: '',
    label: '',
    value: null,
    classes: null,
};

export default withStyles(styles, {withTheme: true})(materialReactSelect);
