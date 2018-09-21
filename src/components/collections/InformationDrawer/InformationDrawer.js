import React from 'react';
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import {withStyles} from '@material-ui/core/styles';
import styles from './InformationDrawer.styles';
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Collection from "./Collection";
import Metadata from "../../metadata/Metadata";
import Permissions from '../../permissions/Permissions'

class InformationDrawer extends React.Component {
    state = {
        refreshRequired: false
    }

    handleDetailsChange(collection) {
        this.props.onDidChangeDetails(collection);
        this.setState({refreshRequired: true});
    }

    handleMetadataDidLoad() {
        this.setState({refreshRequired: false});
    }

    renderCollectionDetails() {
        if(!this.props.collection) {
            return <Typography variant="title">No collection</Typography>;
        }

        return <React.Fragment>
                <Collection
                    collection={this.props.collection}
                    collectionAPI={this.props.collectionAPI}
                    onDidChangeDetails={this.handleDetailsChange.bind(this)}
                />
                <hr/>

                <Permissions collectionId={this.props.collection.id}/>
                <hr/>

                <Metadata
                    refresh={this.state.refreshRequired}
                    onDidLoad={this.handleMetadataDidLoad.bind(this)}
                    subject={this.props.collection.uri}
                    metadataAPI={this.props.metadataAPI}
                />

                <hr/>

                <Typography variant="title">Paths</Typography>
                {this.props.path ? this.props.path.map(path => <Typography
                    key={path.filename}>{path.basename}</Typography>) : 'No path selected'}
            </React.Fragment>
    }

    render() {
        return (
            <Drawer
                variant="persistent"
                anchor="right"
                open={this.props.open}
                classes={{
                    paper: this.props.classes.infoDrawerPaper,
                }}
            >
                <div className={this.props.classes.toolbar}/>
                <IconButton onClick={this.props.onClose} className={this.props.classes.closeButton}>
                    <Icon>chevron_right</Icon>
                </IconButton>

                {this.renderCollectionDetails()}

            </Drawer>
        );
    }
}

export default withStyles(styles)(InformationDrawer);


