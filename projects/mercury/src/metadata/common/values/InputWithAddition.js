import React, {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import {Grid, IconButton} from "@mui/material";
import Add from '@mui/icons-material/Add';

import NewLinkedDataEntityDialog from "../NewLinkedDataEntityDialog";
import LoadingInlay from "../../../common/components/LoadingInlay";
import MessageDisplay from "../../../common/components/MessageDisplay";
import {canAddSharedMetadata} from "../../../users/userUtils";
import UserContext from "../../../users/UserContext";

const InputWithAddition = ({
    children, onChange,
    pending, error, shape, requireIdentifier = true
}) => {
    const {currentUser} = useContext(UserContext);
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
                    size="large"
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
        <Grid container justifyContent="space-between" spacing={1}>
            <Grid item xs={10}>
                {children}
            </Grid>
            <Grid item xs={2}>
                {canAddSharedMetadata(currentUser) && renderAddFunctionality()}
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
