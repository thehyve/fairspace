import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Grid, IconButton} from "@material-ui/core";
import Add from '@material-ui/icons/Add';

import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/components/LoadingInlay";
import MessageDisplay from "../../../common/components/MessageDisplay";

const InputWithAddition = ({
    children, onChange,
    pending, error, shape, requireIdentifier = true
}) => {
    const [adding, setAdding] = useState(false);

    const handleCloseDialog = () => setAdding(false);

    const onCreate = ({subject}) => {
        handleCloseDialog();
        onChange({id: subject});
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
                <IconButton
                    aria-label="Add"
                    title="Add a new"
                    onClick={() => setAdding(true)}
                >
                    <Add />
                </IconButton>
                {adding && (
                    <NewLinkedDataEntityDialog
                        shape={shape}
                        onCreate={onCreate}
                        onClose={handleCloseDialog}
                        requireIdentifier={requireIdentifier}
                    />
                )}
            </>
        );
    };

    return (
        <Grid container justify="space-between" spacing={1}>
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
    onChange: PropTypes.func.isRequired,
    requireIdentifier: PropTypes.bool,
    error: PropTypes.bool,
    pending: PropTypes.bool
};

export default InputWithAddition;
