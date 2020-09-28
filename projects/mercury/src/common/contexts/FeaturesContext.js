import axios from 'axios';
import React from 'react';
import {extractJsonData} from "../utils/httpUtils";
import useAsync from "../hooks/UseAsync";

export type Feature = 'MetadataEditing'; // more to come

const FeaturesContext = React.createContext({});

export const FeaturesProvider = ({children}) => {
    const {data = []} = useAsync(() => axios.get('/api/v1/features/').then(extractJsonData));

    return (
        <FeaturesContext.Provider
            value={{isFeatureEnabled: (feature: Feature) => data.includes(feature)}}
        >
            {children}
        </FeaturesContext.Provider>
    );
};

export default FeaturesContext;
