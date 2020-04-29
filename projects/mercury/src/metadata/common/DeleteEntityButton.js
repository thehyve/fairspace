import React, {useContext, useState} from 'react';
import {IconButton} from "@material-ui/core";
import Delete from "@material-ui/icons/Delete";
import useIsMounted from "react-is-mounted-hook";
import {ConfirmationButton, ErrorDialog} from "../../common";
import {ProgressButton} from '../../common/components';
import LinkedDataContext from "../LinkedDataContext";
import UserContext from "../../users/UserContext";
import {isDataSteward} from "../../users/userUtils";

const DeleteEntityButton = ({subject, isDeletable, updateLinkedData}) => {
    const {deleteLinkedDataEntity} = useContext(LinkedDataContext);
    const {currentUser} = useContext(UserContext);
    const [isDeleting, setDeleting] = useState(false);

    const isMounted = useIsMounted();

    const handleDelete = () => {
        setDeleting(true);

        deleteLinkedDataEntity(subject)
            .catch(e => ErrorDialog.showError(e, "An error occurred deleting the entity"))
            .then(updateLinkedData)
            .then(() => isMounted() && setDeleting(false));
    };

    if (!isDataSteward(currentUser)) {
        return <div />;
    }

    return (
        <ProgressButton active={isDeleting}>
            <ConfirmationButton
                message="Are you sure you want to delete this resource?"
                agreeButtonText="Delete"
                dangerous
                onClick={handleDelete}
                disabled={!isDeletable}
            >
                <IconButton
                    aria-label="Delete this resource"
                    title="Delete"
                    disabled={!isDeletable}
                >
                    <Delete />
                </IconButton>
            </ConfirmationButton>
        </ProgressButton>
    );
};

export default DeleteEntityButton;
