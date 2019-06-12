import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {FormHelperText, Grid} from "@material-ui/core";
import MaterialReactSelect from "../../common/MaterialReactSelect";
import BaseInputValue from "./values/BaseInputValue";
import {getVocabulary} from "../../../reducers/cache/vocabularyReducers";

const noNamespace = {
    id: '',
    label: '(no namespace)',
    value: ''
};

export const LinkedDataIdentifierField = props => {
    const namespaceOptions = [
        noNamespace,
        ...props.namespaces.map(namespace => ({
            id: namespace.id,
            label: namespace.label,
            value: namespace.namespace
        }))
    ];

    return (
        <>
            <Grid container justify="space-between" spacing={8}>
                <Grid item xs={4}>
                    <MaterialReactSelect
                        options={namespaceOptions}
                        value={props.namespace || noNamespace}
                        onChange={props.onNamespaceChange}
                    />
                </Grid>
                <Grid item xs={8} style={{paddingTop: 8, paddingBottom: 0}}>
                    <BaseInputValue
                        property={{}}
                        entry={{value: props.localPart}}
                        onChange={e => props.onLocalPartChange(e.value)}
                        type="url"
                    />
                </Grid>
            </Grid>
            <FormHelperText>
                {props.required ? 'Enter a valid identifier for this entity' : 'If not provided, the identifier will be inferred from the other properties'}
            </FormHelperText>
        </>
    );
};

LinkedDataIdentifierField.propTypes = {
    localPart: PropTypes.string,
    namespace: PropTypes.object,
    onLocalPartChange: PropTypes.func,
    onNamespaceChange: PropTypes.func,
    namespaces: PropTypes.array
}

const mapStateToProps = state => ({
    namespaces: getVocabulary(state).getNamespaces()
});

export default connect(mapStateToProps)(LinkedDataIdentifierField)
