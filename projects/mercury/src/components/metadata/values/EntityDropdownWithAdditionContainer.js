import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";
import * as metadataActions from "../../../actions/metadataActions";
import NewLinkedDataEntityDialog from "../common/NewLinkedDataEntityDialog";
import LoadingInlay from "../../common/LoadingInlay";
import ErrorMessage from "../../common/ErrorMessage";
import {ErrorDialog} from "../../common";
import {getVocabulary, hasVocabularyError, isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import {createIri, getFirstPredicateProperty} from "../../../utils/metadataUtils";
import * as constants from "../../../constants";
import EntityDropdownContainer from "./EntityDropdownContainer";

class EntityDropdownWithAdditionContainer extends React.Component {
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
            .catch(e => ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`));
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
                    linkedData={this.props.vocabulary.emptyLinkedData(this.props.shape)}
                    onCreate={this.handleEntityCreation}
                    onClose={this.handleCloseDialog}
                />
            </>
        );
    }

    render() {
        return (
            <Grid container justify="space-between">
                <Grid item xs={11}>
                    <EntityDropdownContainer
                        property={this.props.property}
                        entry={this.props.entry}
                        onChange={this.props.onChange}
                    />
                </Grid>
                <Grid item xs={1}>
                    {this.renderAddFunctionality()}
                </Grid>
            </Grid>
        );
    }
}

EntityDropdownWithAdditionContainer.propTypes = {
    vocabulary: PropTypes.object.isRequired,
    property: PropTypes.object.isRequired,
    entry: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,

    error: PropTypes.bool,
    pending: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    const vocabulary = getVocabulary(state);
    const pending = isVocabularyPending(state);
    const error = hasVocabularyError(state);

    const shape = (!pending && !error) ? getVocabulary(state).determineShapeForType(ownProps.property.className) : {};

    return {
        pending,
        error,
        shape,
        vocabulary
    };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchEntities: metadataActions.fetchEntitiesIfNeeded,
    onCreate: (formKey, shape, id) => {
        const subject = createIri(id);
        const type = ownProps.property.className;
        return dispatch(metadataActions.createMetadataEntityFromState(formKey, subject, type));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(EntityDropdownWithAdditionContainer);
