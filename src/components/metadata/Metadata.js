import React from 'react';
import PropTypes from "prop-types";
import FetchVocabulary from "./FetchVocabulary";
import FetchMetadata from "./FetchMetadata";
import MetadataViewer from "./MetadataViewer";

const Metadata = (props) => {
    return (
        <FetchVocabulary>
            {({isFetching, data, error}) => {
                if(data) {
                    const vocabulary = data;

                    return (
                    <FetchMetadata subject={props.subject}>
                        {({isFetching, data, error}) => {
                            if (data) {
                                return (
                                    <MetadataViewer vocabulary={vocabulary} metadata={data}/>
                                )
                            }
                        }}
                    </FetchMetadata>
                    )
                }
            }}
        </FetchVocabulary>
    )
};

Metadata.propTypes = {
    children: PropTypes.func
};

export default Metadata
