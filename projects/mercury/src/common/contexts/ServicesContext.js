import axios from 'axios';
import React from 'react';
import {extractJsonData} from "../utils/httpUtils";
import useAsync from "../hooks/UseAsync";

const ServicesContext = React.createContext({});

export const ServicesProvider = ({children}) => {
    const {data: services = [], loading: servicesLoading, error: servicesError} = useAsync(() => axios.get('/api/v1/services/').then(extractJsonData));

    return (
        <ServicesContext.Provider
            value={{
                services,
                servicesLoading,
                servicesError,
            }}
        >
            {children}
        </ServicesContext.Provider>
    );
};

export default ServicesContext;
