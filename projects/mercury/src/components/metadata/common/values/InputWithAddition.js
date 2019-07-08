import React from 'react';
import PropTypes from 'prop-types';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";
import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/LoadingInlay";
import MessageDisplay from "../../../common/MessageDisplay";
import {
    normalizeMetadataResource, partitionErrors, simplifyUriPredicates
} from "../../../../utils/linkeddata/metadataUtils";
import {ErrorDialog} from "../../../common";
import ValidationErrorsDisplay from "../ValidationErrorsDisplay";

class InputWithAddition extends React.Component {
    state = {
        adding: false,
    };

    handleAdd = () => {
        this.setState({adding: true});
    };

    handleCloseDialog = () => {
        this.setState({adding: false});
    };

    handleEntityCreation = (formKey, shape, id) => {
        const {onChange, onCreate} = this.props;

        onCreate(formKey, shape, id)
            .then(({value}) => {
                const otherEntry = simplifyUriPredicates(normalizeMetadataResource(value.values));
                this.handleCloseDialog();
                onChange({id: value.subject, otherEntry});
            })
            .catch(e => {
                if (e.details) {
                    ErrorDialog.renderError(ValidationErrorsDisplay, partitionErrors(e.details, id), e.message);
                } else {
                    ErrorDialog.showError(e, `Error creating a new entity.\n${e.message}`);
                }
            });
    }

    renderAddFunctionality() {
        if (this.props.pending) {
            return <LoadingInlay />;
        }

        if (this.props.error) {
            return <MessageDisplay />;
        }

        return (
            <>
                <Button
                    variant="text"
                    aria-label="Add"
                    title="Add a new"
                    onClick={this.handleAdd}
                >
                    <Icon>add</Icon>
                </Button>

                {this.state.adding && (
                    <NewLinkedDataEntityDialog
                        shape={this.props.shape}
                        linkedData={this.props.emptyData}
                        onCreate={this.handleEntityCreation}
                        onClose={this.handleCloseDialog}
                        requireIdentifier={this.props.requireIdentifier}
                    />
                )}
            </>
        );
    }

    render() {
        return (
            <Grid container justify="space-between" spacing={8}>
                <Grid item xs={10}>
                    {this.props.children}
                </Grid>
                <Grid item xs={2}>
                    {this.renderAddFunctionality()}
                </Grid>
            </Grid>
        );
    }
}

InputWithAddition.propTypes = {
    shape: PropTypes.object.isRequired,
    emptyData: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    requireIdentifier: PropTypes.bool,

    error: PropTypes.bool,
    pending: PropTypes.bool
};

InputWithAddition.defaultProps = {
    requireIdentifier: true
};

export default InputWithAddition;
