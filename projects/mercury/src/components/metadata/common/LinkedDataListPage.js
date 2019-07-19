import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {Checkbox, FormControl, Input, ListItemText, MenuItem, Paper, Select, withStyles} from "@material-ui/core";

import {LoadingInlay, MessageDisplay, SearchBar} from "../../common";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";
import useLinkedDataSearch from '../UseLinkedDataSearch';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';

const styles = theme => ({
    typeSelect: {
        paddingLeft: theme.spacing.unit * 10
    }
});

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const LinkedDataListPage = ({classes, history, listComponent: ListComponent}) => {
    const {
        query, setQuery, selectedTypes, setSelectedTypes,
        size, setSize, page, setPage,
        shapes, shapesLoading, searchPending, error,
        availableTypes, items, total, hasHighlights,
    } = useLinkedDataSearch(true);

    const {
        requireIdentifier, editorPath,
        hasEditRight
    } = useContext(LinkedDataContext);

    const renderTypeClass = ({targetClass, label}) => (
        <MenuItem key={targetClass} value={targetClass}>
            <Checkbox checked={selectedTypes.includes(targetClass)} />
            <ListItemText primary={label} secondary={targetClass} />
        </MenuItem>
    );

    const ListBody = () => {
        if (searchPending) {
            return <LoadingInlay />;
        }

        if (error) {
            return <MessageDisplay message={error.message || 'An error occurred while loading metadata'} />;
        }

        if (items && items.length > 0) {
            return (
                <ListComponent
                    items={items}
                    total={total}
                    hasHighlights={hasHighlights}
                    size={size}
                    setSize={setSize}
                    page={page}
                    setPage={setPage}
                    onOpen={(id) => history.push(getEntityRelativeUrl(editorPath, id))}
                />
            );
        }

        return <MessageDisplay message={query && query !== '*' ? 'No results found' : 'The metadata is empty'} isError={false} />;
    };

    const getTypeLabel = (type) => availableTypes.find(({targetClass}) => targetClass === type).label;

    return (
        <>
            <BreadCrumbs />
            <Paper>
                <SearchBar
                    placeholder="Search"
                    disableUnderline
                    onSearchChange={setQuery}
                />
                <FormControl className={classes.typeSelect}>
                    <Select
                        multiple
                        displayEmpty
                        value={selectedTypes}
                        onChange={e => setSelectedTypes(e.target.value)}
                        input={<Input id="select-multiple-checkbox" />}
                        renderValue={selected => (selected.length === 0 ? '[All types]' : selected.map(getTypeLabel).join(', '))}
                    >
                        {availableTypes.map(renderTypeClass)}
                    </Select>
                </FormControl>
            </Paper>
            {
                hasEditRight ? (
                    <LinkedDataCreator
                        shapesLoading={shapesLoading}
                        shapes={shapes}
                        requireIdentifier={requireIdentifier}
                        onCreate={({subject}) => history.push(getEntityRelativeUrl(editorPath, subject))}
                    >
                        <ListBody />
                    </LinkedDataCreator>
                ) : <ListBody />
            }

        </>
    );
};

export default withRouter(withStyles(styles)(LinkedDataListPage));
