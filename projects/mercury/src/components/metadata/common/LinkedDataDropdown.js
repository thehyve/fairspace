import React from 'react';
import {PropTypes} from 'prop-types';

import searchAPI, {SORT_ALPHABETICALLY} from "../../../services/SearchAPI";
import {linkLabel, propertyContainsValueOrId} from "../../../utils/linkeddata/metadataUtils";
import {LoadingInlay, MessageDisplay} from "../../common";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../../../constants";

class LinkedDataDropdown extends React.Component {
    state = {
        fetchedItems: null,
        error: null,
    }

    mounted = true;

    fetchRequest = null;

    componentDidMount() {
        this.updateResults();
    }

    updateResults = (query) => {
        const {property, fetchItems, types} = this.props;
        const typesToFetch = Array.isArray(types) && types.length > 0 ? types : [property.className];

        fetchItems({types: typesToFetch, size: SEARCH_DROPDOWN_DEFAULT_SIZE, query})
            .then(({items}) => {
                if (this.mounted) {
                    this.setState({fetchedItems: items});
                }
            })
            .catch(e => {
                if (this.mounted) {
                    this.setState({error: e, fetchedItems: []});
                }
            });
    }

    onTextInputChange = (e) => {
        if (this.fetchRequest) {
            clearTimeout(this.fetchRequest);
        }
        const {value} = e.target;
        this.fetchRequest = setTimeout(() => {
            this.updateResults(value);
        }, 300);
    };

    componentWillUnmount() {
        this.mounted = false;
        if (this.fetchRequest) {
            clearTimeout(this.fetchRequest);
        }
    }

    render() {
        const {property, ...otherProps} = this.props;
        const {fetchedItems, error} = this.state;

        if (error) {
            return <MessageDisplay withIcon={false} message={error.message} />;
        }

        if (!fetchedItems) {
            return <LoadingInlay />;
        }

        const options = fetchedItems
            .map(metadataItem => {
                const {id, label, name} = metadataItem;
                const disabled = propertyContainsValueOrId(property, undefined, id);
                const displayLabel = (label && label[0]) || (name && name[0]) || linkLabel(id, true);

                return {
                    disabled,
                    label: displayLabel,
                    id,
                    otherEntry: metadataItem
                };
            });

        return (
            <Dropdown
                {...otherProps}
                onTextInputChange={this.onTextInputChange}
                options={options}
            />
        );
    }
}

LinkedDataDropdown.defaultProps = {
    fetchItems: ({types, size}) => searchAPI().searchLinkedData({types, size, sort: SORT_ALPHABETICALLY})
};

LinkedDataDropdown.propTypes = {
    fetchItems: PropTypes.func,
    property: PropTypes.object.isRequired,
    types: PropTypes.arrayOf(PropTypes.string)
};

export default LinkedDataDropdown;
