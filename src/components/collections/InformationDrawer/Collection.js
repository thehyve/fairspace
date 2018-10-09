import React from 'react';
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import ErrorDialog from "../../error/ErrorDialog";
import {connect} from 'react-redux'
import * as collectionActions from '../../../actions/collections'
import CollectionEditor from "../CollectionList/CollectionEditor";

class Collection extends React.Component{
    constructor(props) {
        super(props);
        this.onDidChangeDetails = props.onDidChangeDetails;

        this.state = {
            collection: props.collection,
            editing: false,
            showEditButton: false
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            collection: props.collection,
            editing: false
        });
    }

    closeEditDialog() {
        this.setState({editing: false});
    }

    handleChangeDetails(name, description) {
        this.closeEditDialog();

        if ((name !== this.state.collection.name || description !== this.state.collection.description) && name !== '') {
            this.props.updateCollection(this.state.collection.id, name, description)
                .then(() => {
                    let collection = Object.assign(this.state.collection, {name: name, description: description});

                    if (this.onDidChangeDetails) {
                        this.onDidChangeDetails(collection);
                    }
                })
                .catch(e => ErrorDialog.showError(e, "An error occurred while updating collection metadata"));
        }
    }

    handleTextMouseEnter() {
        this.setState({showEditButton: true});
    }
    handleTextMouseLeave() {
        this.setState({showEditButton: false});
    }

    handleTextClick() {
        this.setState({editing: true});
    }

    render() {
        return (
            <div>
                <div
                    onClick={this.handleTextClick.bind(this)}
                    onMouseEnter={this.handleTextMouseEnter.bind(this)}
                    onMouseLeave={this.handleTextMouseLeave.bind(this)}
                >
                    <Typography variant="headline" component='h2'>{this.state.collection.name} {this.state.showEditButton ? (<Icon>edit</Icon>) : ''}</Typography>
                    <Typography gutterBottom variant='subheading' color="textSecondary">Owner: {this.state.collection.creator}</Typography>
                    <Typography component='p'>{this.state.collection.description}</Typography>
                </div>

                <CollectionEditor
                    editing={this.state.editing}
                    name={this.state.collection.name}
                    description={this.state.collection.description}
                    title={"Edit collection: " + this.state.collection.name}
                    onSave={this.handleChangeDetails.bind(this)}
                    onCancel={this.closeEditDialog.bind(this)}
                />
            </div>
        );
    }
}

const mapStateToProps = null
const mapDispatchToProps = {
    ...collectionActions
}

export default connect(mapStateToProps, mapDispatchToProps)(Collection);




