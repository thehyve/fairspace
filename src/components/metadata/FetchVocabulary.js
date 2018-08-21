import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../Fetch/Fetch";
import Config from "../../components/generic/Config/Config"

const FetchVocabulary = (props) => {
    return (
        <Fetch url={Config.get().urls.vocabulary}>
            {this.props.children}
        </Fetch>
    )
};

FetchVocabulary.propTypes = {
    children: PropTypes.func
};

export default FetchVocabulary
