import React from 'react';
import PropTypes from 'prop-types';
import {List, Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../../common";

import MetaEntityHeader from './MetaEntityHeader';
import MetadataProperty from "../MetadataProperty";

export class MetaEntity extends React.Component {
    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (this.props.subject !== prevProps.subject) {
            this.load();
        }
    }

    load() {
        if (this.props.subject) {
            this.props.fetchShapes();
            this.props.fetchData(this.props.subject);
        }
    }

    render() {
        const {subject, label, typeInfo, properties, editable, error, loading, showHeader} = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        const entity = (
            <List dense>
                {
                    properties.map((p) => (
                        <MetadataProperty
                            editable={editable && p.editable}
                            subject={subject}
                            key={p.key}
                            property={p}
                        />
                    ))
                }
            </List>
        );

        return showHeader ? (
            <>
                <MetaEntityHeader label={label} typeInfo={typeInfo} />
                <Paper style={{paddingLeft: 20}}>
                    {entity}
                </Paper>
            </>
        ) : entity;
    }
}

MetaEntity.propTypes = {
    fetchShapes: PropTypes.func,
    fetchData: PropTypes.func,
    subject: PropTypes.string,

    label: PropTypes.string,
    typeInfo: PropTypes.string,

    properties: PropTypes.array,
    editable: PropTypes.bool,

    error: PropTypes.bool,
    loading: PropTypes.bool,
    showHeader: PropTypes.bool
};

export default MetaEntity;
