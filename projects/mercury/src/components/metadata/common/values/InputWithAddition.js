import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, Grid} from "@material-ui/core";

import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/LoadingInlay";
import MessageDisplay from "../../../common/MessageDisplay";
import {normalizeMetadataResource, simplifyUriPredicates} from "../../../../utils/linkeddata/metadataUtils";

const InputWithAddition = ({
    children, onChange, onCreate, onEntityCreationError,
    pending, error, shape, emptyData, requireIdentifier = true
}) => {
    const [adding, setAdding] = useState(false);

    const handleCloseDialog = () => setAdding(false);

    const handleEntityCreation = (formKey, s, id) => {
        onCreate(formKey, s, id)
            .then(({value}) => {
                const otherEntry = simplifyUriPredicates(normalizeMetadataResource(value.values));
                handleCloseDialog();
                onChange({id: value.subject, otherEntry});
            })
            .catch(e => {
                onEntityCreationError(e, id);
            });
    };

    const renderAddFunctionality = () => {
        if (pending) {
            return <LoadingInlay />;
        }

        if (error) {
            return <MessageDisplay />;
        }

        return (
            <>
                <Button
                    variant="text"
                    aria-label="Add"
                    title="Add a new"
                    onClick={() => setAdding(true)}
                >
                    <Icon>add</Icon>
                </Button>

                {adding && (
                    <NewLinkedDataEntityDialog
                        shape={shape}
                        linkedData={emptyData}
                        onCreate={handleEntityCreation}
                        onClose={handleCloseDialog}
                        requireIdentifier={requireIdentifier}
                    />
                )}
            </>
        );
    };

    return (
        <Grid container justify="space-between" spacing={8}>
            <Grid item xs={10}>
                {children}
            </Grid>
            <Grid item xs={2}>
                {renderAddFunctionality()}
            </Grid>
        </Grid>
    );
};

InputWithAddition.propTypes = {
    shape: PropTypes.object.isRequired,
    emptyData: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    requireIdentifier: PropTypes.bool,
    error: PropTypes.bool,
    pending: PropTypes.bool
};

export default InputWithAddition;
