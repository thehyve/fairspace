import React from 'react';
import {Column, Row} from 'simple-flexbox';
import PropTypes from 'prop-types';

const GenericCollectionsScreen = (props) => (
    <div>
        <Row>
            <Column flexGrow={1} vertical='center' horizontal='start'>
                <div>
                    {props.breadCrumbs}
                </div>
            </Column>
            <Row>
                {props.buttons}
            </Row>
        </Row>

        {props.main}
    </div>
)

GenericCollectionsScreen.propTypes = {
    breadCrumbs: PropTypes.node.isRequired,
    buttons: PropTypes.node,
    main: PropTypes.node.isRequired
}

export default GenericCollectionsScreen



