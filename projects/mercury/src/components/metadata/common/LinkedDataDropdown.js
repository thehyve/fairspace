import React from 'react';
import {PropTypes} from 'prop-types';

import searchAPI from "../../../services/SearchAPI";
import {linkLabel, propertyContainsValueOrId} from "../../../utils/linkeddata/metadataUtils";
import {LoadingInlay, MessageDisplay} from "../../common";
import Dropdown from './values/Dropdown';
import {SEARCH_DROPDOWN_DEFAULT_SIZE} from "../../../constants";

class LinkedDataDropdown extends React.Component {
    state = {
        fetchedItems: null,
        error: null
    }

    mounted = true;

    componentDidMount() {
        const {property, fetchItems, types} = this.props;
        const typesToFetch = Array.isArray(types) && types.length > 0 ? types : [property.className];

        fetchItems({types: typesToFetch, size: SEARCH_DROPDOWN_DEFAULT_SIZE})
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

    componentWillUnmount() {
        this.mounted = false;
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
            .map(({id, label, name, value}) => {
                const disabled = propertyContainsValueOrId(property, value, id);
                const l = (label && label[0]) || (name && name[0]) || linkLabel(id, true);

                return {
                    disabled,
                    label: l,
                    id,
                };
            });

        return <Dropdown {...otherProps} options={options} />;
    }
}

LinkedDataDropdown.defaultProps = {
    fetchItems: (types, size) => searchAPI().searchLinkedData(types, size)
};

LinkedDataDropdown.propTypes = {
    fetchItems: PropTypes.func,
    property: PropTypes.object.isRequired,
};

export default LinkedDataDropdown;
