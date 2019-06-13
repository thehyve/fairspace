import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@material-ui/core";

import {generateUuid, getLabel, isValidLinkedDataIdentifier} from "../../../utils/linkeddata/metadataUtils";
import LinkedDataEntityFormContainer from "./LinkedDataEntityFormContainer";
import {hasLinkedDataFormUpdates, hasLinkedDataFormValidationErrors} from "../../../reducers/linkedDataFormReducers";
import {getFirstPredicateValue} from "../../../utils/linkeddata/jsonLdUtils";
import * as consts from "../../../constants";
import LinkedDataIdentifierField from "./LinkedDataIdentifierField";

class NewLinkedDataEntityDialog extends React.Component {
    state = {
        formKey: generateUuid(),
        localPart: this.props.requireIdentifier ? generateUuid() : '',
        namespace: undefined
    };

    componentDidUpdate(prevProps) {
        // Reset form key and new identifier when the
        // dialog opens to prevent reusing the same
        // identifier
        if (!prevProps.open && this.props.open) {
            this.resetDialog();
        }
    }

    resetDialog() {
        this.setState({
            formKey: generateUuid(),
            localPart: this.props.requireIdentifier ? generateUuid() : '',
            namespace: undefined
        });
    }

    closeDialog = (e) => {
        if (e) e.stopPropagation();
        this.props.onClose();
    };

    createEntity = (e) => {
        if (e) e.stopPropagation();
        this.props.onCreate(this.state.formKey, this.props.shape, this.getIdentifier());
    };

    getIdentifier = () => (this.state.namespace ? this.state.namespace.value + this.state.localPart : this.state.localPart);

    handleLocalPartChange = localPart => this.setState({localPart});

    handleNamespaceChange = namespace => this.setState({namespace});

    render() {
        const {shape, open, storeState} = this.props;
        const {formKey} = this.state;
        const typeLabel = getLabel(shape);
        const typeDescription = getFirstPredicateValue(shape, consts.SHACL_DESCRIPTION);

        return (
            <Dialog
                open={open}
                onClose={this.closeDialog}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="form-dialog-title">
                    New entity: {typeLabel}
                    <Typography variant="body2">{typeDescription}</Typography>
                </DialogTitle>

                <DialogContent style={{overflowX: 'hidden'}}>
                    {this.renderDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.closeDialog}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={this.createEntity}
                        color="primary"
                        disabled={!this.canCreate() || !hasLinkedDataFormUpdates(storeState, formKey) || hasLinkedDataFormValidationErrors(storeState, formKey)}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderDialogContent() {
        const form = (
            <LinkedDataEntityFormContainer
                formKey={this.state.formKey}
                properties={this.props.linkedData}
            />
        );

        const idField = (
            <LinkedDataIdentifierField
                namespace={this.state.namespace}
                localPart={this.state.localPart}
                onLocalPartChange={this.handleLocalPartChange}
                onNamespaceChange={this.handleNamespaceChange}
                required={this.props.requireIdentifier}
            />
        );

        // If the identifier field is not required, it will be inferred from other
        // properties by default. This makes the field quite unimportant, so it will
        // be rendered at the bottom. See VRE-830 for details
        return this.props.requireIdentifier
            ? (
                <>
                    {idField}
                    {form}
                </>
            ) : (
                <>
                    {form}
                    {idField}
                </>
            );
    }

    canCreate() {
        return !this.props.requireIdentifier || (this.getIdentifier() && isValidLinkedDataIdentifier(this.getIdentifier()));
    }
}

NewLinkedDataEntityDialog.propTypes = {
    shape: PropTypes.object,
    onCreate: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool,
    requireIdentifier: PropTypes.bool
};

NewLinkedDataEntityDialog.defaultProps = {
    requireIdentifier: true
};

const mapStateToProps = (state) => ({
    storeState: state,
});

export default connect(mapStateToProps)(NewLinkedDataEntityDialog);
