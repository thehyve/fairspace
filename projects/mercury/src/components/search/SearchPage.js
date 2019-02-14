import React from 'react';
import {withRouter} from 'react-router-dom';

import SearchResults from './SearchResults';
import {buildSearchUrl, getSearchQueryFromString, getSearchTypeFromString} from '../../utils/searchUtils';
import {searchCollections, searchFiles} from '../../services/SearchAPI';

class SearchPage extends React.Component {
    state = {
        type: 'collections',
        collections: [],
        files: []
    };

    componentDidMount() {
        this.updateSearchResults();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.search !== prevProps.location.search) {
            this.updateSearchResults();
        }
    }

    updateSearchResults = () => {
        const type = this.getCurrentSearchType();
        const query = this.getCurrentSearchQuery();
        this.setState({type});

        if (type === 'collections') {
            searchCollections(query)
                .then(collections => {
                    this.setState({collections});
                });
        } else if (type === 'files') {
            searchFiles(query)
                .then(files => {
                    this.setState({files});
                });
        } else {
            throw Error('Unrecognized search type.');
        }
    }

    getCurrentSearchType = () => getSearchTypeFromString(this.props.location.search);

    getCurrentSearchQuery = () => getSearchQueryFromString(this.props.location.search);

    handleTypeChange = (type) => {
        const query = this.getCurrentSearchQuery();
        const searchUrl = buildSearchUrl(type, query);
        this.props.history.push(searchUrl);
    };

    handleCollectionOpen = (collection) => {
        this.props.history.push(`/collections/${collection.id}`);
    }

    handlefileOpen = (file) => {
        // TODO: handle file open (implementation on file browser depends on current opened collection)
    }

    render() {
        const {collections, files, type} = this.state;

        return (
            <SearchResults
                type={type}
                onTypeChange={this.handleTypeChange}
                collections={collections}
                onCollectionOpen={this.handleCollectionOpen}
                files={files}
                onFileOpen={this.handlefileOpen}
            />
        );
    }
}

export default withRouter(SearchPage);
