import React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import SearchResults from './SearchResults';
import {buildSearchUrl, getSearchQueryFromString} from '../../utils/searchUtils';
import * as searchActions from '../../actions/searchActions';
import {ErrorMessage} from "../common";

class SearchPage extends React.Component {
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
        performSearch(search);
    };

    handleTypeChange = (type) => {
        const query = getSearchQueryFromString(this.props.location.search);
        const searchUrl = buildSearchUrl(type, query);
        this.props.history.push(searchUrl);
    };

    handleCollectionOpen = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    handleFileOpen = () => {
        // TODO: handle file open (currently don't have collection info within the file info)
    }

    render() {
        const {results, searchType, loading, error} = this.props;

        if (error && !loading) {
            return <ErrorMessage message={error} />;
        }

        return (
            <SearchResults
                loading={loading}
                type={searchType}
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
    searchType: search.searchType,
    results: search.results,
    error: search.error
});

const mapDispatchToProps = {
    performSearch: searchActions.performSearch
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
