import React, {useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {
    Input, ListItemText, MenuItem, Select, withStyles, Grid, Chip
} from "@material-ui/core";

import {LoadingInlay, MessageDisplay, SearchBar} from "../../common";
import BreadCrumbs from "../../common/breadcrumbs/BreadCrumbs";
import useLinkedDataSearch from '../UseLinkedDataSearch';
import LinkedDataCreator from "./LinkedDataCreator";
import LinkedDataContext from '../LinkedDataContext';

const styles = theme => ({
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    }
});

const getEntityRelativeUrl = (editorPath, id) => `${editorPath}?iri=` + encodeURIComponent(id);

const LinkedDataListPage = ({classes, history, listComponent: ListComponent}) => {
    const {
        query, setQuery, selectedTypes, setSelectedTypes,
        size, setSize, page, setPage,
        shapes, shapesLoading, shapesError, searchPending, searchError,
        availableTypes, items, total, hasHighlights,
    } = useLinkedDataSearch(true);

    const {
        requireIdentifier, editorPath,
        hasEditRight
    } = useContext(LinkedDataContext);

    const ListBody = () => {
        if (shapesLoading || searchPending) {
            return <LoadingInlay />;
        }

        if (shapesError) {
            return <MessageDisplay message={shapesError.message || 'An error occurred while loading the shapes'} />;
        }

        if (searchError) {
            return <MessageDisplay message={searchError.message || 'An error occurred while loading metadata'} />;
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
            <Grid style={{minHeight: 60}} container alignItems="center" justify="space-evenly">
                <Grid xs={6} item>
                    <SearchBar
                        placeholder="Search"
                        disableUnderline={false}
                        onSearchChange={setQuery}
                    />
                </Grid>
                <Grid xs={5} item>
                    <Select
                        multiple
                        displayEmpty
                        value={selectedTypes}
                        onChange={e => setSelectedTypes(e.target.value)}
                        input={<Input fullWidth disableUnderline style={{margin: '8px 0'}} />}
                        renderValue={selected => (selected.length === 0 ? 'Types' : (
                            <div className={classes.chips}>
                                {selected.map(value => <Chip key={value} label={getTypeLabel(value)} className={classes.chip} />)}
                            </div>
                        ))}
                    >
                        {availableTypes.map(({targetClass, label}) => (
                            <MenuItem key={targetClass} value={targetClass}>
                                <ListItemText primary={label} secondary={targetClass} />
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            {
                hasEditRight ? (
                    <LinkedDataCreator
                        shapesLoading={shapesLoading}
                        shapesError={shapesError}
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
