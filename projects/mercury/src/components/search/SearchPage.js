import React from 'react';
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import SearchResults from './SearchResults';
import {getSearchQueryFromString} from '../../utils/searchUtils';
import {getCollectionAbsolutePath} from '../../utils/collectionUtils';
import {getParentPath} from '../../utils/fileUtils';
import * as searchActions from '../../actions/searchActions';
import * as vocabularyActions from '../../actions/vocabularyActions';
import * as collectionBrowserActions from "../../actions/collectionBrowserActions";
import {ErrorMessage} from "../common";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../../constants";
import {getVocabulary, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";

// Exporting here to be able to test the component outside of Redux
export class SearchPage extends React.Component {
    componentDidMount() {
        this.props.fetchVocabularyIfNeeded();
        this.updateResults();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.updateResults();
        }
    }

    updateResults = () => {
        const {location: {search}, performSearch} = this.props;
        const query = getSearchQueryFromString(search);

        performSearch(query);
    };

    /**
     * Handles a click on a search result.
     * @param result   The clicked search result. For the format, see the ES api
     */
    handleResultDoubleClick = (result) => {
        const {history, selectPath, deselectAllPaths} = this.props;
        const navigationPath = getCollectionAbsolutePath(this.getPathOfResult(result));

        history.push(navigationPath);
        deselectAllPaths();
        selectPath('/' + result.filePath[0]);
    }

    getPathOfResult = (result) => {
        const type = result.type[0];

        switch (type) {
            case COLLECTION_URI:
            case DIRECTORY_URI:
                return result.filePath[0];
            case FILE_URI:
                return getParentPath(result.filePath[0]);
            default:
                // TODO: handle metadata open. Out of scope for now
                return '';
        }
    }

    render() {
        const {results, vocabulary, loading, error} = this.props;

        if (!loading && error) {
            return <ErrorMessage message={error} />;
        }

        return (
            <SearchResults
                loading={loading}
                results={results}
                onResultDoubleClick={this.handleResultDoubleClick}
                vocabulary={vocabulary}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    loading: state.search.pending || isVocabularyPending(state),
    results: state.search.results,
    error: state.search.error,
    vocabulary: getVocabulary(state)
});

const mapDispatchToProps = {
    performSearch: searchActions.performSearch,
    fetchVocabularyIfNeeded: vocabularyActions.fetchMetadataVocabularyIfNeeded,
    selectPath: collectionBrowserActions.selectPath,
    deselectAllPaths: collectionBrowserActions.deselectAllPaths
};

SearchPage.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    performSearch: PropTypes.func.isRequired,
    fetchVocabularyIfNeeded: PropTypes.func.isRequired
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
