import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../Fetch/Fetch";
import config from "../../config";

const FetchUsername = (props) => {
    return (
        <Fetch url={config.urls.accountName}>
            {props.children}
        </Fetch>
    )
}

FetchUsername.propTypes = {
    children: PropTypes.func
}

export default FetchUsername;