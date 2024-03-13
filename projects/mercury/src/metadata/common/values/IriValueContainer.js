import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {Grid, TextField} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import BaseInputValue from './BaseInputValue';
import LinkedDataContext from '../../LinkedDataContext';

export const noNamespace = {
    id: '',
    label: '(no namespace)',
    value: ''
};

export const IriValue = React.forwardRef(
    (
        {
            namespace,
            namespaces = [],
            localPart = '',
            onNamespaceChange = () => {},
            onLocalPartChange = () => {}
        },
        ref
    ) => {
        const namespaceOptions = [
            noNamespace,
            ...namespaces.map(n => ({
                id: n.id,
                label: n.label,
                value: n.namespace,
                isDefault: n.isDefault
            }))
        ];

        const defaultNamespace = namespaceOptions.find(n => n.isDefault) || noNamespace;

        if (!namespace) {
            onNamespaceChange(defaultNamespace);
        }

        return (
            <Grid container alignItems="flex-end" justifyContent="space-between" spacing={1}>
                <Grid item xs={4}>
                    <Autocomplete
                        options={namespaceOptions}
                        value={namespace || defaultNamespace}
                        onChange={(e, v) => {
                            onNamespaceChange(v);
                        }}
                        getOptionDisabled={option => option.disabled}
                        getOptionLabel={option => option.label}
                        renderInput={props => <TextField ref={ref} fullWidth {...props} />}
                    />
                </Grid>
                <Grid item xs={8} style={{paddingTop: 8, paddingBottom: 0}}>
                    <BaseInputValue
                        property={{}}
                        entry={{value: localPart}}
                        onChange={e => onLocalPartChange(e.value)}
                        type="url"
                    />
                </Grid>
            </Grid>
        );
    }
);

IriValue.propTypes = {
    localPart: PropTypes.string,
    namespace: PropTypes.object,
    onLocalPartChange: PropTypes.func,
    onNamespaceChange: PropTypes.func,
    namespaces: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            prefix: PropTypes.string,
            namespace: PropTypes.string
        })
    )
};

export default React.forwardRef((props, ref) => {
    const {namespaces} = useContext(LinkedDataContext);
    return <IriValue ref={ref} namespaces={namespaces} {...props} />;
});
