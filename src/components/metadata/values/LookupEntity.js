import React from 'react';
import PropTypes from 'prop-types';
import MaterialReactSelect from "../../generic/MaterialReactSelect/MaterialReactSelect";

const suggestions = [
    { label: 'Afghanistan', id: 'http://af' },
    { label: 'Aland Islands', id: 'http://al' },
    { label: 'Albania', id: 'http://ab' },
    { label: 'Algeria', id: 'http://ag' },
    { label: 'American Samoa', id: 'http://as' },
    { label: 'Andorra', id: 'http://an' },
    { label: 'Angola', id: 'http://ao' },
    { label: 'Belgium', id: 'http://be' },
    { label: 'Brazil', id: 'http://br' },
];

function LookupEntity(props) {
    return <div style={{width: '100%'}}>
        <MaterialReactSelect options={suggestions}
                             onChange={props.onSave}
                             placeholder={'Add new...'}/>
    </div>
}

LookupEntity.propTypes = {
    property: PropTypes.object.isRequired,
    entry: PropTypes.object
};

export default LookupEntity;
