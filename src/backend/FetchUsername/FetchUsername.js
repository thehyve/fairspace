import React from 'react';
import PropTypes from "prop-types"
import Fetch from "../Fetch/Fetch";
import config from "../../config";

const FetchUsername = (props) => {
    return (
        <Fetch url={config.accountNameUrl}>
            {props.children}
        </Fetch>
    )
}

FetchUsername.propTypes = {
    children: PropTypes.func
}

export default FetchUsername;