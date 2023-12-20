import React, {useContext} from 'react';
import * as PropTypes from "prop-types";
import {Box, Modal, Tooltip} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkedDataEntityPage from "./LinkedDataEntityPage";
import UserContext from '../../users/UserContext';
/**
 * Renders a link to the metadata editor.
 *
 * @param props
 * @constructor
 */

const styleModalDialog = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
const styleCloseButton = {
    float: 'right'
};

const getModal = (open, handleClose, uri) => (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <Box sx={styleModalDialog}>
            <Tooltip title="Close - click or press 'Esc'">
                <CloseIcon onClick={handleClose} sx={styleCloseButton} />
            </Tooltip>
            <LinkedDataEntityPage title="Metadata" subject={uri} />
        </Box>
    </Modal>
);

const LinkedDataLink = ({uri, children}) => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {currentUser} = useContext(UserContext);
    if (currentUser && currentUser.canViewPublicMetadata) {
        return (
            <div>
                <div onClick={handleOpen}>
                    {children}
                </div>
                {getModal(open, handleClose, uri)}
            </div>
        );
    }
    return children;
};

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired
};

export default LinkedDataLink;
