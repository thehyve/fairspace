import axios from 'axios';
import React from 'react';
import {extractJsonData, handleHttpError} from '../utils/httpUtils';
import useAsync from '../hooks/UseAsync';
import {getSvgIcons} from '../IconAPI';

export type Service = {
    path: string,
    name: string,
    iconPath: string,
    icon: string // URL to the crated svg `Blob` object
};

const ServicesContext = React.createContext({});

export const ServicesProvider = ({children}) => {
    const {
        data: services = ([]: Service[]),
        loading: servicesLoading,
        error: servicesError
    } = useAsync(() =>
        axios.get('/api/services/').then(extractJsonData).then(getSvgIcons).catch(handleHttpError('Connection error.'))
    );

    return (
        <ServicesContext.Provider
            value={{
                services,
                servicesLoading,
                servicesError
            }}
        >
            {children}
        </ServicesContext.Provider>
    );
};

export default ServicesContext;
