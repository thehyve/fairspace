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
        const {user, currentLoggedUser, collaborators} = this.props;
        const {userList} = this.state;

        this.setState({
            accessRight: user ? user.access : 'Read',
            selectedUser: user ? userList.find(u => user.subject === u.value) : null,
            selectedUserLabel: '',
            userList: userList.map(r => {
                r.disabled = collaborators.find(c => c.subject === r.id) || r.id === currentLoggedUser.id;
                return r;
            }),
            error: null,
        });
    };

    componentDidMount() {
        userAPI.getUsers().then(result => {
            const options = result.map(r => {
                let newUser = Object.assign({}, r);
                newUser.label = `${r.firstName} ${r.lastName}`;
                newUser.value = `${r.id}`;
                return newUser;
            });
            this.setState({userList: options});
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

    getUser = (user) => {
        return this.state.userList.find(u => u.value === user.subject);
    };

    renderUser = () => {
        const {user} = this.props;
        const {userList, selectedUser, selectedUserLabel} = this.state;

        if (user) {
            const selectedUserOption = this.getUser(user);
            return (<div>
                <Typography variant="subheading"
                            gutterBottom>{`${selectedUserOption.label}`}</Typography>
            </div>)
        }

        return (<MaterialReactSelect options={userList}
                                     onChange={this.handleSelectedUserChange}
                                     placeholder={'Please select a user'}
                                     value={selectedUser}
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
    collectionId: PropTypes.number,
    collaborators: PropTypes.array,
};

const mapStateToProps = ({account: {user}}) => {
    return {
        currentLoggedUser: user.data
    }
};

export default connect(mapStateToProps)(withStyles(styles, {withTheme: true})(ShareWithDialog));
