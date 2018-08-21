import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../Fetch/Fetch";
import Config from "../../components/generic/Config/Config"

const FetchMetadata = (props) => {
    return (
        <Fetch url={Config.get().urls.metadata+encodeURI(props.subject)}>
            {this.props.children}
        </Fetch>
    )
};

FetchMetadata.propTypes = {
    children: PropTypes.func
};

export default FetchMetadata
