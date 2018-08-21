import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../Fetch/Fetch";
import Config from "../../components/generic/Config/Config"

const FetchUsername = (props) => {
    return (
        <Fetch url={Config.get().urls.accountName}>
            {(fetch) => {
                // Store username in config to be able to use it anywhere
                if (fetch.data) {
                    Config.get().user = fetch.data;
                }

                return props.children(fetch);
            }}
        </Fetch>
    )
};

FetchUsername.propTypes = {
    children: PropTypes.func
};

export default FetchUsername
