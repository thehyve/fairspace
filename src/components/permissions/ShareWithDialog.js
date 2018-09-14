import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
    },
});

class ShareWithDialog extends React.Component {
    state = {
        single: null,
        multi: null,
    };

    handleChange = name => value => {
        this.setState({
            [name]: value,
        });
    };

    handleClose = () => {
        this.props.onClose();
    };

    render() {
        const {classes} = this.props;

        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}>
                <DialogTitle id="scroll-dialog-title">Share with</DialogTitle>
                <DialogContent>
                    <div className={classes.container}>
                        <FormControl className={classes.formControl}>
                            <TextField
                                id="user-name"
                                required
                                label='User'
                            />
                            <FormHelperText>Select a user</FormHelperText>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="access-right">Access Right</InputLabel>
                            <Select
                                value={''}
                                onChange={this.handleChange}
                                input={<Input name="access-right" id="access-right"/>}
                                required
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={10}>Manage</MenuItem>
                                <MenuItem value={20}>Read</MenuItem>
                                <MenuItem value={30}>Write</MenuItem>
                            </Select>
                            <FormHelperText>Select access right for the user.</FormHelperText>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleClose} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ShareWithDialog.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(ShareWithDialog);
