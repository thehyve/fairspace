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
import {invalidateMetadata} from "../../../actions/metadata";

class InformationDrawer extends React.Component {
    handleDetailsChange(collection) {
        this.props.onDidChangeDetails(collection);
        this.props.dispatch(invalidateMetadata(this.props.collection.uri));
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

                <Metadata subject={this.props.collection.uri} />

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


