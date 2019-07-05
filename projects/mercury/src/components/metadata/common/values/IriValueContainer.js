import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {Grid} from "@material-ui/core";
import MaterialReactSelect from "../../../common/MaterialReactSelect";
import BaseInputValue from "./BaseInputValue";
import {getVocabulary} from "../../../../reducers/cache/vocabularyReducers";

export const noNamespace = {
    id: '',
    label: '(no namespace)',
    value: ''
};

export const IriValue = props => {
    const namespaceOptions = [
        noNamespace,
        ...props.namespaces.map(namespace => ({
            id: namespace.id,
            label: namespace.label,
            value: namespace.namespace,
            isDefault: namespace.isDefault
        }))
    ];

    const defaultNamespace = namespaceOptions.find(n => n.isDefault) || noNamespace;

    return (
        <Grid container justify="space-between" spacing={8}>
            <Grid item xs={4}>
                <MaterialReactSelect
                    options={namespaceOptions}
                    value={props.namespace || defaultNamespace}
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
    );
};

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

IriValue.defaultProps = {
    namespaces: []
};

const mapStateToProps = state => ({
    namespaces: getVocabulary(state).getNamespaces()
});

export default connect(mapStateToProps)(IriValue);
