import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Grid from "@material-ui/core/Grid";

import Dropdown from "./Dropdown";
import {createMetadataEntity, fetchEntitiesIfNeeded} from "../../../actions/metadataActions";
import NewMetadataEntityDialog from "../NewMetadataEntityDialog";
import LoadingInlay from "../../common/LoadingInlay";
import ErrorMessage from "../../common/ErrorMessage";
import {ErrorDialog} from "../../common";

class EntityDropdown extends React.Component {
    state = {
        adding: false,
    };

    constructor(props) {
        super(props);
        props.fetchEntitiesIfNeeded(props.property.className);
    }

    handleAdd = () => {
        this.setState({adding: true});
    };

    handleCloseDialog = () => {
        this.setState({adding: false});
    };

    handleEntityCreation = (shape, id) => {
        this.props.createMetadataEntity(shape, id)
            .then((res) => {
                this.handleCloseDialog();
                this.props.fetchEntitiesIfNeeded(this.props.property.className);
                this.props.onSave({id: res.value});
            })
            .catch(e => ErrorDialog.showError(e, `Error creating a new metadata entity.\n${e.message}`));
    }

    render() {
        if (this.props.pending) {
            return <LoadingInlay />;
        }

        if (this.props.error) {
            return <ErrorMessage message={this.props.error} />;
        }

        return (
            <Grid container justify="space-between">
                <Grid item xs={11}>
                    <Dropdown {...this.props} />
                </Grid>
                <Grid item xs={1}>
                    <Button
                        variant="text"
                        aria-label="Add"
                        title="Add a new"
                        onClick={this.handleAdd}
                    >
                        <Icon>add</Icon>
                    </Button>

                    <NewMetadataEntityDialog
                        open={this.state.adding}
                        shape={this.props.shape}
                        onCreate={this.handleEntityCreation}
                        onClose={this.handleCloseDialog}
                    />
                </Grid>
            </Grid>
        );
    }
}

EntityDropdown.propTypes = {
    property: PropTypes.object.isRequired
};

const mapStateToProps = ({cache: {entitiesByType, vocabulary}}, ownProps) => {
    const dropdownOptions = entitiesByType[ownProps.property.className];
    const pending = !dropdownOptions || dropdownOptions.pending || vocabulary.pending;
    const error = !dropdownOptions || dropdownOptions.error || vocabulary.error;

    const entities = (!pending && !error) ? dropdownOptions.data : [];
    const shape = (!pending && !error) ? vocabulary.data.determineShapeForType(ownProps.property.className) : {};

    return {
        pending,
        error,
        entities,
        shape
    };
};

const mapDispatchToProps = {
    fetchEntitiesIfNeeded,
    createMetadataEntity
};

export default connect(mapStateToProps, mapDispatchToProps)(EntityDropdown);
