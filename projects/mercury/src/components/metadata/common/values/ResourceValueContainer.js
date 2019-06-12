import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Grid from "@material-ui/core/Grid";
import BaseInputValue from "./BaseInputValue";
import {getVocabulary} from "../../../../reducers/cache/vocabularyReducers";
import MaterialReactSelect from "../../../common/MaterialReactSelect";

const noNamespace = {
    id: '',
    label: '(no namespace)',
    value: ''
};

export class ResourceValue extends React.Component {
    state = {
        selectedNamespace: noNamespace
    };

    render() {
        const {dispatch, entry, onChange, namespaces, ...otherProps} = this.props;

        const setSelectedNamespace = selectedNamespace => this.setState({selectedNamespace});

        const enhancedEntry = {...entry, value: entry.id || ''};
        const enhancedOnChange = ({value}) => {
            onChange({id: this.state.selectedNamespace.value + value});
        };

        const namespaceOptions = [
            noNamespace,
            ...namespaces.map(namespace => ({
                id: namespace.id,
                label: namespace.label,
                value: namespace.namespace
            }))
        ];

        return (
            <Grid container justify="space-between" spacing={8}>
                <Grid item xs={4}>
                    <MaterialReactSelect
                        options={namespaceOptions}
                        value={this.state.selectedNamespace}
                        onChange={v => setSelectedNamespace(v)}
                    />
                </Grid>
                <Grid item xs={8} style={{paddingTop: 8, paddingBottom: 0}}>
                    <BaseInputValue
                        {...otherProps}
                        entry={enhancedEntry}
                        onChange={enhancedOnChange}
                        type="url"
                    />
                </Grid>
            </Grid>
        );
    }
};

ResourceValue.propTypes = {
    entry: PropTypes.object,
    namespaces: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            prefix: PropTypes.string,
            namespace: PropTypes.string
        })
    )
};

ResourceValue.defaultProps = {
    entry: {},
    namespaces: []
};

const mapStateToProps = state => ({
    namespaces: getVocabulary(state).getNamespaces()
});

export default connect(mapStateToProps)(ResourceValue);
