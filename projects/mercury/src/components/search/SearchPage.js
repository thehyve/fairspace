import React from 'react';
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import SearchResults from './SearchResults';
import {buildSearchUrl, getSearchQueryFromString, getSearchTypeFromString} from '../../utils/searchUtils';
import {getCollectionAbsolutePath} from '../../utils/collectionUtils';
import * as searchActions from '../../actions/searchActions';
import {ErrorMessage} from "../common";

// Exporting here to be able to test the component outside of Redux
export class SearchPage extends React.Component {
    componentDidMount() {
        this.updateResults();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.updateResults();
        }
    }

    updateResults = () => {
        const {location: {search}, performSearch} = this.props;

        const type = getSearchTypeFromString(search);
        const query = getSearchQueryFromString(search);

        performSearch(query, type);
    };

    handleTypeChange = (type) => {
        const query = getSearchQueryFromString(this.props.location.search);
        const searchUrl = buildSearchUrl(type, query);
        this.props.history.push(searchUrl);
    };

    handleCollectionOpen = (collection) => {
        this.props.history.push(getCollectionAbsolutePath(collection));
    }

    handleFileOpen = () => {
        // TODO: handle file open (currently don't have collection info within the file info)
    }

    render() {
        const {results, type, loading, error} = this.props;

        if (!loading && error) {
            return <ErrorMessage message={error} />;
        }

        return (
            <SearchResults
                loading={loading}
                type={type}
                results={results}
                onTypeChange={this.handleTypeChange}
                onCollectionOpen={this.handleCollectionOpen}
                onFileOpen={this.handleFileOpen}
            />
        );
    }
}

const mapStateToProps = ({search}) => ({
    loading: search.pending,
    type: search.searchType,
    results: search.results,
    error: search.error,
});

const mapDispatchToProps = {
    performSearch: searchActions.performSearch
};

SearchPage.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    performSearch: PropTypes.func.isRequired
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
