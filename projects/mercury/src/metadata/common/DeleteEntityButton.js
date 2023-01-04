import React, {useContext, useState} from 'react';
import {IconButton} from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import useIsMounted from "react-is-mounted-hook";
import LinkedDataContext from "../LinkedDataContext";
import UserContext from "../../users/UserContext";
import {isAdmin} from "../../users/userUtils";
import ErrorDialog from "../../common/components/ErrorDialog";
import ProgressButton from "../../common/components/ProgressButton";
import ConfirmationButton from "../../common/components/ConfirmationButton";

const DeleteEntityButton = ({subject, isDeletable, updateLinkedData}) => {
    const {deleteLinkedDataEntity} = useContext(LinkedDataContext);
    const {currentUser} = useContext(UserContext);
    const [isDeleting, setDeleting] = useState(false);

    const isMounted = useIsMounted();

    const handleDelete = () => {
        setDeleting(true);

        deleteLinkedDataEntity(subject)
            .catch(e => ErrorDialog.showError("An error occurred deleting the entity", e))
            .then(updateLinkedData)
            .then(() => isMounted() && setDeleting(false));
    };

    if (!isAdmin(currentUser)) {
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
                    size="medium"
                >
                    <Delete />
                </IconButton>
            </ConfirmationButton>
        </ProgressButton>
    );
};

export default DeleteEntityButton;
