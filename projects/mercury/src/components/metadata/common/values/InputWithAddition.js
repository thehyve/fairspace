import React from 'react';
import PropTypes from 'prop-types';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";
import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/LoadingInlay";
import ErrorMessage from "../../../common/ErrorMessage";
import {ErrorDialog} from "../../../common";
import {getFirstPredicateProperty} from "../../../../utils/linkeddata/jsonLdUtils";
import * as constants from "../../../../constants";

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
        this.props.onCreate(formKey, shape, id)
            .then(({value}) => {
                const label = getFirstPredicateProperty(value.values, constants.LABEL_URI, 'value')
                                || getFirstPredicateProperty(value.values, constants.SHACL_NAME, 'value');

                this.handleCloseDialog();
                this.props.fetchEntities(this.props.property.className);
                this.props.onChange({id: value.subject, label});
            })
            .catch(e => ErrorDialog.showError(e, `Error creating a new entity.\n${e.message}`));
    }

    renderAddFunctionality() {
        if (this.props.pending) {
            return <LoadingInlay />;
        }

        if (this.props.error) {
            return <ErrorMessage />;
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

                <NewLinkedDataEntityDialog
                    open={this.state.adding}
                    shape={this.props.shape}
                    linkedData={this.props.emptyData}
                    onCreate={this.handleEntityCreation}
                    onClose={this.handleCloseDialog}
                    valueComponentFactory={this.props.valueComponentFactory}
                />
            </>
        );
    }

    render() {
        return (
            <Grid container justify="space-between">
                <Grid item xs={11}>
                    {this.props.children}
                </Grid>
                <Grid item xs={1}>
                    {this.renderAddFunctionality()}
                </Grid>
            </Grid>
        );
    }
}

InputWithAddition.propTypes = {
    shape: PropTypes.object.isRequired,
    emptyData: PropTypes.array.isRequired,
    property: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    fetchEntities: PropTypes.func.isRequired,

    error: PropTypes.bool,
    pending: PropTypes.bool,
    valueComponentFactory: PropTypes.object
};

export default InputWithAddition;
