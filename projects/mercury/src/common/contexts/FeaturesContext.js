import axios from 'axios';
import React from 'react';
import {extractJsonData, handleHttpError} from '../utils/httpUtils';
import useAsync from '../hooks/UseAsync';

export type Feature = 'ExtraStorage' | 'LlmSearch' | any; // more to come

const FeaturesContext = React.createContext({});

export const FeaturesProvider = ({children}) => {
    const {data = []} = useAsync(() =>
        axios.get('/api/features/').then(extractJsonData).catch(handleHttpError('Connection error.'))
    );

    return (
        <FeaturesContext.Provider value={{isFeatureEnabled: (feature: Feature) => data.includes(feature)}}>
            {children}
        </FeaturesContext.Provider>
    );
};

export default FeaturesContext;
