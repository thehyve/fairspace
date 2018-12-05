import React from 'react';
import {Column, Row} from 'simple-flexbox';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core'

const GenericCollectionsScreen = (props) => (
    <Paper>
        <Row>
            <Column flexGrow={1} vertical='center' horizontal='start'>
                <div>
                    {props.breadCrumbs}
                </div>
            </Column>
            {props.buttons ? <Row>{props.buttons}</Row> : null}
        </Row>

        {props.main}
    </Paper>
)

GenericCollectionsScreen.propTypes = {
    breadCrumbs: PropTypes.node.isRequired,
    buttons: PropTypes.node,
    main: PropTypes.node.isRequired
}

export default GenericCollectionsScreen



