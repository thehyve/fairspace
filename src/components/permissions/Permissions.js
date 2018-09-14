import React from 'react';
import Loader from '../generic/Loader/Loader';
import permissionStore from '../../services/PermissionAPI/PermissionAPI'
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import {compareBy, comparing} from "../../utils/comparators";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";

class Permissions extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            collectionId: props.collectionId,
            showEditButton: false
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (!this.props.collectionId) {
            this.props.collectionId = false;
        }

        if (this.props.collectionId !== prevProps.collectionId) {
            this.setState({
                collectionId: this.props.collectionId
            });
        }
    }

    toggleEditButton = () => {
        return this.setState({showEditButton: !this.state.showEditButton})
    };

    loadPermissions = () => {
        return permissionStore.getCollectionPermissions(this.state.collectionId)
    };

    renderPermissions = (permissions) => {
        return (
            <div>
                <Typography variant="subheading"
                            onMouseEnter={this.toggleEditButton}
                            onMouseLeave={this.toggleEditButton}>
                    Shared with:&nbsp;
                    {this.state.showEditButton ? <Icon style={{fontSize: '.9em'}}>edit</Icon> : ''}
                </Typography>
                <List>
                    {
                        permissions
                            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
                            .map(p => (<ListItem>{`${p.subject} (${p.access})`}</ListItem>))
                    }
                </List>
            </div>
        )
    };

    render() {
        return (<Loader what={'permissions'}
                        onLoad={this.loadPermissions}
                        onRender={this.renderPermissions}/>)
    }
}

export default Permissions
