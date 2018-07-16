import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../Fetch/Fetch";
import Config from "../../components/Config/Config"

const FetchUsername = (props) => {
    return (
        <Fetch url={Config.get().urls.accountName}>
            {props.children}
        </Fetch>
    )
}

FetchUsername.propTypes = {
    children: PropTypes.func
}

export default FetchUsername
