import React from 'react';
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import SearchResults from './SearchResults';
import {getSearchQueryFromString} from '../../utils/searchUtils';
import {getCollectionAbsolutePath} from '../../utils/collectionUtils';
import * as searchActions from '../../actions/searchActions';
import * as metadataActions from '../../actions/metadataActions';
import {ErrorMessage} from "../common";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from "../../constants";

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
     * @param hit   The clicked search result. For the format, see the ES api
     */
    handleResultDoubleClick = (hit) => {
        /* eslint-disable no-underscore-dangle */
        const resultType = hit._source.type[0];
        if (resultType === COLLECTION_URI) {
            this.props.history.push(getCollectionAbsolutePath(hit._source.filePath[0]));
        } else if (resultType === DIRECTORY_URI) {
            // TODO: handle directory open. See VRE-580
        } else if (resultType === FILE_URI) {
            // TODO: handle file open. See VRE-580
        } else {
            // TODO: handle metadata open. Out of scope for now
        }
    }

    render() {
        const {results, loading, error} = this.props;

        if (!loading && error) {
            return <ErrorMessage message={error} />;
        }

        return (
            <SearchResults
                loading={loading}
                results={results}
                onResultDoubleClick={this.handleResultDoubleClick}
                vocabulary={this.props.vocabulary}
            />
        );
    }
}

const mapStateToProps = ({search, cache: {vocabulary}}) => ({
    loading: search.pending || !vocabulary || vocabulary.pending,
    results: search.results,
    error: search.error,
    vocabulary: vocabulary && vocabulary.data
});

const mapDispatchToProps = {
    performSearch: searchActions.performSearch,
    fetchVocabularyIfNeeded: metadataActions.fetchMetadataVocabularyIfNeeded
};

SearchPage.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    performSearch: PropTypes.func.isRequired,
    fetchVocabularyIfNeeded: PropTypes.func.isRequired
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
