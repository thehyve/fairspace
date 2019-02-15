import React from 'react';
import {withRouter} from 'react-router-dom';

import SearchResults from './SearchResults';
import {buildSearchUrl, getSearchQueryFromString, getSearchTypeFromString} from '../../utils/searchUtils';
import {performSearch} from '../../services/SearchAPI';

class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: getSearchTypeFromString(props.location.search),
            onGoingSearch: false,
            results: []
        };
    }

    componentDidMount() {
        this.updateResults();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.updateResults();
        }
    }

    updateResults = () => {
        const {location: {search}} = this.props;
        const type = getSearchTypeFromString(search);

        if (!this.state.onGoingSearch) {
            performSearch(search)
                .then(results => {
                    this.setState({results, type});
                });
        }
    };

    handleTypeChange = (type) => {
        if (type !== this.state.type) {
            this.setState({results: [], type});
            const query = getSearchQueryFromString(this.props.location.search);
            const searchUrl = buildSearchUrl(type, query);
            this.props.history.push(searchUrl);
        }
    };

    handleCollectionOpen = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    handlefileOpen = (file) => {
        // TODO: handle file open (implementation on file browser depends on current opened collection)
    }

    render() {
        const {results, type} = this.state;

        return (
            <SearchResults
                type={type}
                onTypeChange={this.handleTypeChange}
                results={results}
                onCollectionOpen={this.handleCollectionOpen}
                onFileOpen={this.handlefileOpen}
            />
        );
    }
}

export default withRouter(SearchPage);
