import {connect} from 'react-redux';
import React from 'react';
import {Paper} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {linkLabel} from "../../utils/metadatautils";

const entityInformation = (props) => {
    const {subject, typeInfo} = props;
    return (
        <Paper style={{padding: 20}}>
            <Typography variant="h6">
                {linkLabel(subject)}
            </Typography>
            <Typography variant="h7">
                {typeInfo}
            </Typography>
        </Paper>
    );
};

const mapStateToProps = (state, ownProps) => {
    const {metadataBySubject} = state;
    const {subject} = ownProps;
    const typeProp = metadataBySubject
        && metadataBySubject[subject]
        && metadataBySubject[subject].data
        ? metadataBySubject[subject].data.find(prop => prop.key === '@type') : null;
    const label = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].label;
    const comment = typeProp && typeProp.values && typeProp.values.length && typeProp.values[0].comment;
    const typeInfo = (label && comment) ? `${label} - ${comment}` : (label || comment);

    return {
        subject,
        typeInfo
    };
};

export default connect(mapStateToProps)(entityInformation);
