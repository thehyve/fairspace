import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {extractJsonData} from "../utils";

const ServicesContext = React.createContext({});

export const ServicesProvider = ({children}) => {
    const [services, setServices] = useState({});
    const [servicesLoading, setServicesLoading] = useState(true);
    const [servicesError, setServicesError] = useState(false);

    useEffect(() => axios.get('/api/v1/services/')
        .then(extractJsonData)
        .then(setServices)
        .then(() => setServicesLoading(false))
        .catch(() => setServicesError(true)),
    []);

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
