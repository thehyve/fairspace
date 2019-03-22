import React from 'react';
import {connect} from 'react-redux';
import {Paper} from '@material-ui/core';

import {ErrorMessage, LoadingInlay} from "../common";
import {fetchCombinedMetadataIfNeeded} from "../../actions/metadataActions";
import MetaEntity from "./MetaEntity";
import MetaEntityHeader from './MetaEntityHeader';
import {isDateTimeProperty, propertiesToShow, linkLabel} from "../../utils/metadataUtils";

export class MetadataEntityContainer extends React.Component {
    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps) {
        if (this.props.subject !== prevProps.subject) {
            this.load();
        }
    }

    load() {
        const {dispatch, subject} = this.props;

        if (subject) {
            dispatch(fetchCombinedMetadataIfNeeded(subject));
        }
    }

    render() {
        const {
            subject, label, typeInfo, properties, editable = true, error, loading, showHeader = false
        } = this.props;

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (loading) {
            return <LoadingInlay />;
        }

        if (!properties) {
            return null;
        }

        const entity = <MetaEntity subject={subject} properties={properties} editable={editable} />;

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

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject, cache: {vocabulary}} = state;
    const subject = ownProps.subject || window.location.href;
    const metadata = metadataBySubject[subject];
    const hasNoMetadata = !metadata || !metadata.data || metadata.data.length === 0;
    const hasOtherErrors = (metadata && metadata.error) || !vocabulary || vocabulary.error;
    const typeProp = metadata && metadata.data && metadata.data.find(prop => prop.key === '@type');
    const typeLabel = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].label;
    const comment = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].comment;
    const typeInfo = (typeLabel && comment) ? `${typeLabel} - ${comment}` : (typeLabel || comment);
    const label = linkLabel(subject);

    if (hasNoMetadata || hasOtherErrors) {
        const message = hasOtherErrors ? 'An error occurred while loading metadata.' : '(404) No such resource.';
        return {
            error: new Error(message),
            subject,
            label
        };
    }

    const properties = propertiesToShow(metadata.data)
        .map(p => ({
            ...p,
            editable: !isDateTimeProperty(p)
        }));

    return {
        loading: metadata.pending || vocabulary.pending,
        properties,
        subject,
        typeInfo,
        label
    };
};

export default connect(mapStateToProps)(MetadataEntityContainer);
