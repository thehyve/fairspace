import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Grid, Icon} from "@material-ui/core";

import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/LoadingInlay";
import MessageDisplay from "../../../common/MessageDisplay";
import {normalizeMetadataResource, simplifyUriPredicates} from "../../../../utils/linkeddata/metadataUtils";

const InputWithAddition = ({
    children, onChange,
    pending, error, shape, emptyData, requireIdentifier = true
}) => {
    const [adding, setAdding] = useState(false);

    const handleCloseDialog = () => setAdding(false);

    const onCreate = ({subject, values}) => {
        const otherEntry = simplifyUriPredicates(normalizeMetadataResource(values));
        handleCloseDialog();
        onChange({id: subject, otherEntry});
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
                        onCreate={onCreate}
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
    requireIdentifier: PropTypes.bool,
    error: PropTypes.bool,
    pending: PropTypes.bool
};

export default InputWithAddition;
