import React from 'react';
import Loader from '../generic/Loader/Loader';
import permissionStore from '../../services/PermissionStore/PermissionStore'
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import {compareBy, comparing} from "../../utils/comparators";
import Typography from "@material-ui/core/Typography";

class Permissions extends React.Component {
    constructor(props) {
        super(props);

        this.collectionId = props.collectionId;
    }

    componentWillReceiveProps(props) {
        this.collectionId = props.collectionId;
    }

    loadPermissions() {
        return permissionStore.getCollectionPermissions(this.collectionId, null)
    }

    static renderPermissions(permissions) {
        return (
            <div>
                <Typography variant="subheading">Shared by:</Typography>
                <List>
                    {
                        permissions
                            .sort(comparing(compareBy(Permissions.permissionLevel), compareBy('subject')))
                            .map(p => (<ListItem>{`${p.subject} (${p.access})`}</ListItem>))
                    }
                </List>
            </div>
        )
    }

    static permissionLevel(p) {
        return {Manage: 0, Write: 1, Read: 2}[p.access]
    }

    render() {
        return (<Loader what={'permissions'}
                        onLoad={this.loadPermissions.bind(this)}
                        onRender={Permissions.renderPermissions}/>)
    }
}

export default Permissions
