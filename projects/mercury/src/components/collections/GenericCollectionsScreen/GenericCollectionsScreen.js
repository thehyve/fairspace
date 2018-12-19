import React from 'react';
import {Column, Row} from 'simple-flexbox';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';

const GenericCollectionsScreen = props => {
    const buttons = props.buttons ? (
        <Row>
            <Column flexGrow={1} vertical="center" horizontal="end">
                <Row>
                    {props.buttons}
                </Row>
            </Column>
        </Row>
    ) : null;

    return (
        <Paper>
            <Row>
                <Column flexGrow={1} vertical="center" horizontal="start">
                    {props.breadCrumbs}
                </Column>
            </Row>
            {buttons}
            {props.main}
        </Paper>
    );
};

GenericCollectionsScreen.propTypes = {
    breadCrumbs: PropTypes.node.isRequired,
    buttons: PropTypes.node,
    main: PropTypes.node.isRequired
};

export default GenericCollectionsScreen;
