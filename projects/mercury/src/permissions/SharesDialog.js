// @flow
import React, {useState} from 'react';
import {List} from '@material-ui/core';
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Checkbox from "@material-ui/core/Checkbox";
import FormHelperText from "@material-ui/core/FormHelperText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import ErrorDialog from "../common/components/ErrorDialog";

export const SharesDialog = ({collection, setPermission, principalType, shareCandidates = [],
    setBusy = () => {}, showDialog, setShowDialog = () => {}}) => {
    const [selectedPrincipals, setSelectedPrincipals] = useState([]);
    const [accessRight, setAccessRight] = useState("List");

    const handleShareCollection = () => {
        setBusy(true);
        setShowDialog(false);
        Promise.all(selectedPrincipals.map(principal => setPermission(collection.location, principal, accessRight)))
            .catch(e => ErrorDialog.showError(e, 'Error sharing the collection'))
            .finally(() => setBusy(false));
    };

    const handleCancelShareCollection = () => setShowDialog(false);

    const toggleSelectedPrincipals = (principals) => {
        const results = [...selectedPrincipals];
        const idx = results.indexOf(principals);
        if (idx < 0) {
            results.push(principals);
        } else {
            results.splice(idx, 1);
        }
        setSelectedPrincipals(results);
    };

    const renderAccessRightSelector = () => (
        <FormControl>
            <InputLabel id="access-right-label">Access right</InputLabel>
            <Select
                labelId="access-right-selector-label"
                id="access-right-selector"
                value={accessRight}
                onChange={e => setAccessRight(e.target.value)}
            >
                <MenuItem value="List">List</MenuItem>
                <MenuItem value="Read">Read</MenuItem>
            </Select>
            <FormHelperText>Select access level</FormHelperText>
        </FormControl>
    );

    const renderShareCandidatesList = () => (
        <List>
            {
                shareCandidates.map(candidate => (
                    <ListItem key={candidate.iri} onClick={() => toggleSelectedPrincipals(candidate.iri)}>
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={selectedPrincipals.includes(candidate.iri)}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={candidate.name}
                            style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        />
                    </ListItem>
                ))
            }
        </List>
    );

    return (
        <Dialog open={showDialog}>
            <DialogTitle>Share collection {collection.name} with other {principalType}</DialogTitle>
            <DialogContent>
                {
                    shareCandidates.length ? (
                        <div>
                            {renderAccessRightSelector()}
                            {renderShareCandidatesList()}
                        </div>
                    ) : `This collection has been already shared with all ${principalType}.`
                }
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleShareCollection}
                    color="default"
                >
                    Ok
                </Button>
                <Button
                    onClick={handleCancelShareCollection}
                    color="default"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SharesDialog;
