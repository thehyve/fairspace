import React from 'react';
import PropTypes from 'prop-types';
import userAPI from '../../services/UserAPI/UserAPI';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import {withStyles} from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import {AccessRights} from "./Permissions";
import MaterialReactSelect from '../generic/MaterialReactSelect/MaterialReactSelect'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import {applyDisableFilter} from "./AlterPermission";

const styles = theme => ({
    root: {
        width: 400,
        height: 350,
        display: 'block',
    },
    rootEdit: {
        width: 400,
        display: 'block',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        marginTop: 20,
    },
    autocomplete: {
        width: '100%'
    },
});

class ShareWithDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accessRight: 'Read',
            selectedUser: null,
            selectedUserLabel: '',
            userList: [],
            error: null,
        };
    }

    resetState = () => {
        const {user, currentLoggedUser, collaborators, collection, options} = this.props;
        this.setState({
            accessRight: user ? user.access : 'Read',
            selectedUser: user ? options.find(u => user.subject === u.value) : null,
            selectedUserLabel: '',
            userList: applyDisableFilter(options, collaborators, currentLoggedUser, collection.owner),
            error: null,
        });
    };

    componentDidMount() {
        this.props.fetchUsers();
    }

    handleAccessRightChange = event => {
        this.setState({accessRight: event.target.value});
    };

    handleSelectedUserChange = selectedOption => {
        this.setState({selectedUser: selectedOption});
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleOnEnter = () => {
        this.resetState();
    };

    handleSubmit = () => {
        const {selectedUser, accessRight} = this.state;
        const {collection, alterPermission} = this.props;
        if (selectedUser) {
            this.handleClose();
            alterPermission(selectedUser.value, collection.id, accessRight);
        } else {
            this.setState({selectedUserLabel: 'You have to select a user'});
        }
    };

    getUser = (user) => {
        return this.state.userList.find(u => u.value === user.subject);
    };

    renderUser = () => {
        const {user, options, noOptionMessage} = this.props;
        const {selectedUser, selectedUserLabel} = this.state;

        if (user) { // if there's user passed from the props
            const selectedUserOption = this.getUser(user);
            return (<div>
                <Typography variant="subheading"
                            gutterBottom>{`${selectedUserOption.label}`}</Typography>
            </div>)
        }

        return (<MaterialReactSelect options={options}
                                     onChange={this.handleSelectedUserChange}
                                     placeholder={'Please select a user'}
                                     value={selectedUser}
                                     noOptionsMessage={noOptionMessage}
                                     label={selectedUserLabel}/>);
    };

    render() {
        const {classes, user} = this.props;
        const {selectedUser, accessRight} = this.state;
        return (
            <Dialog
                open={this.props.open}
                onEnter={this.handleOnEnter}
                onClose={this.handleClose}>
                <DialogTitle id="scroll-dialog-title">Share with</DialogTitle>
                <DialogContent>
                    <div className={user ? classes.rootEdit : classes.root}>
                        {this.renderUser()}
                        <FormControl className={classes.formControl}>
                            <FormLabel component="legend">Access right</FormLabel>
                            <RadioGroup
                                aria-label="Access right"
                                name="access-right"
                                className={classes.group}
                                value={accessRight}
                                onChange={this.handleAccessRightChange}>
                                {Object.keys(AccessRights).map(access => {
                                    return <FormControlLabel key={access} value={access} control={<Radio/>}
                                                             label={AccessRights[access]}/>
                                })}
                            </RadioGroup>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleSubmit} color="primary" disabled={!selectedUser}>
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
    user: PropTypes.object,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    collection: PropTypes.object,
    collaborators: PropTypes.array,
};

export default withStyles(styles, {withTheme: true})(ShareWithDialog);
