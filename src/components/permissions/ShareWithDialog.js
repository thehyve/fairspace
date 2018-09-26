import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import userAPI from '../../services/UserAPI/UserAPI';
import permissionAPI from '../../services/PermissionAPI/PermissionAPI';
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
import ErrorDialog from "../error/ErrorDialog";

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

    // initial state
    state = {
        accessRight: 'Read',
        selectedUser: null,
        selectedUserLabel: '',
        userList: [],
        userOptions: [],
        isEditing: false,
        error: null,
    };

    resetState = () => {
        const {user, collaborators, currentUser} = this.props;
        const {userList} = this.state;
        let selectedUser = null;
        if (user) {
            selectedUser = userList.find(u => {
                return user.subject === u.id;
            });
        }
        this.setState({
            accessRight: user ? user.access : 'Read',
            selectedUser: selectedUser,
            selectedUserLabel: '',
            isEditing: !!user,
            userOptions: userList.map(r => {
                return {
                    label: `${r.firstName} ${r.lastName}`,
                    value: `${r.id}`,
                    disabled: collaborators.find(c => c.subject === r.id || r.id === currentUser.id)
                }
            }),
            error: null,
        });
    };

    componentDidMount() {
        const {collaborators} = this.props;
        userAPI.getUsers().then(result => {
            this.setState({userList: result});
        })
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
        const {collectionId} = this.props;
        if (selectedUser) {
            this.props.onClose();
            permissionAPI.alterCollectionPermission(selectedUser.value, collectionId, accessRight)
                .then(response => {
                    this.setState({selectedUserLabel: ''});
                })
                .catch(error => {
                    this.setState({error: error});
                    ErrorDialog.showError(error, 'An error occurred while altering the permission.');
                });
        } else {
            this.setState({selectedUserLabel: 'You have to select a user'});
        }
    };

    renderUser = () => {
        const {userOptions, isEditing, selectedUser} = this.state;
        return isEditing ?
            (<div>
                <Typography variant="subheading"
                            gutterBottom>{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
            </div>) :
            (<MaterialReactSelect options={userOptions}
                                  onChange={this.handleSelectedUserChange}
                                  placeholder={'Please select a user'}
                                  value={this.state.selectedUser}
                                  label={this.state.selectedUserLabel}/>);
    };

    render() {
        const {classes} = this.props;
        const {isEditing, selectedUser} = this.state;
        return (
            <Dialog
                open={this.props.open}
                onEnter={this.handleOnEnter}
                onClose={this.handleClose}>
                <DialogTitle id="scroll-dialog-title">Share with</DialogTitle>
                <DialogContent>
                    <div className={isEditing ? classes.rootEdit : classes.root}>
                        {this.renderUser()}
                        <FormControl className={classes.formControl}>
                            <FormLabel component="legend">Access right</FormLabel>
                            <RadioGroup
                                aria-label="Access right"
                                name="access-right"
                                className={classes.group}
                                value={this.state.accessRight}
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
};

const mapStateToProps = ({account: {user}}) => {
    return {
        currentUser: user.item
    }
};

export default connect(mapStateToProps)(withStyles(styles, {withTheme: true})(ShareWithDialog));
