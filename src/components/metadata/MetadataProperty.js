import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from '@material-ui/icons/Clear';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import {connect} from 'react-redux';
import {updateMetadata} from "../../actions/metadata";
import ValueComponentFactory from "./values/ValueComponentFactory";
import ListItemText from "@material-ui/core/ListItemText";
import ErrorDialog from "../error/ErrorDialog";

/**
 * Shows the property and values for the property
 */
class MetadataProperty extends React.Component {

    state = {
        hovered: null,
    };

    // Function to save a certain value.
    // Calling it with an index provides you with a function that
    // will save a given value (if it has changed) along with the other
    // unchanged values.
    // E.g. handleSave(1) will return a function `value => { ... }` that
    // can be used as a callback for the component for index 1
    handleSave = index => newEntry => {
        const {property, subject, dispatch} = this.props;
        const currentEntry = property.values[index];
        if (currentEntry.value !== newEntry.value) {
            const updatedValues = property.values.map((el, idx) => {
                if (idx === index) {
                    return newEntry
                } else {
                    return el;
                }
            });
            return dispatch(updateMetadata(subject, property.key, updatedValues))
                .catch(e => ErrorDialog.showError(e, "Error while saving metadata"));
        } else {
            return Promise.resolve();
        }
    };

    handleAdd = (newEntry) => {
        const {property, subject, dispatch} = this.props;
        if (newEntry.value || newEntry.id) {
            const updatedValues = [...property.values, newEntry];

            return dispatch(updateMetadata(subject, property.key, updatedValues))
                .catch(e => ErrorDialog.showError(e, "Error while adding metadata"));
        } else {
            return Promise.resolve();
        }
    };

    handleDelete = index => () => {
        const {property, subject, dispatch} = this.props;
        const updatedValues = property.values.filter((el, idx) => idx !== index);
        return dispatch(updateMetadata(subject, property.key, updatedValues))
            .catch(e => ErrorDialog.showError(e, "Error while deleting metadata"));
    };

    handleListItemMouseover = (value) => {
        this.setState({
            hovered: value
        })
    };

    handleListItemMouseout = (value) => {
        if (this.state.hovered === value) {
            this.setState({hovered: null})
        }
    };

    // Render the given entry as a list item
    renderEntry = (entry, idx, PropertyValueComponent) => {
        const {property, editable} = this.props;
        return (
            <ListItem key={idx}
                      onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                      onMouseOut={() => this.handleListItemMouseout(idx)}
            >
                <ListItemText>
                    <PropertyValueComponent
                        property={property}
                        entry={entry}
                        onSave={this.handleSave(idx)}
                    />
                </ListItemText>
                {
                    editable ?
                        <ListItemSecondaryAction
                            onMouseOver={(e) => this.handleListItemMouseover(idx, e)}
                            onMouseOut={() => this.handleListItemMouseout(idx)}
                        >
                            <IconButton
                                style={{
                                    visibility: this.state.hovered !== idx ? 'hidden' : 'visible'
                                }}
                                size='small'
                                aria-label="Delete"
                                onClick={this.handleDelete(idx)}>
                                <ClearIcon/>
                            </IconButton>
                        </ListItemSecondaryAction> : null
                }
            </ListItem>);
    };

    renderAddComponent = () => {
        const {property} = this.props;
        const ValueAddComponent = ValueComponentFactory.addComponent(property);
        return (
            <ListItem key={property.values.length}>
                <ListItemText>
                    <ValueAddComponent
                        property={property}
                        placeholder="Add new"
                        onSave={this.handleAdd}/>
                </ListItemText>
            </ListItem>
        )
    };

    render() {
        const {editable, property} = this.props;
        // Do not show an add component if no multiples are allowed
        // and there is already a value
        const canAdd = editable && (property.allowMultiple || property.values.length === 0);
        const ValueComponent = editable ?
            ValueComponentFactory.editComponent(property) : ValueComponentFactory.readOnlyComponent();

        return (<ListItem disableGutters key={property.key} style={{display: 'block'}}>
            <Typography variant="body1" component='p'>{property.label}</Typography>
            <List dense>
                {property.values.map((entry, idx) => this.renderEntry(entry, idx, ValueComponent))}
                {canAdd ? this.renderAddComponent() : null}
            </List>
        </ListItem>)
    }

}

export default connect()(MetadataProperty)
