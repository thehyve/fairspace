import React from 'react';
import axios from "axios";
import useAsync from "../common/hooks/UseAsync";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

export type ExternalStorage = {
    url: string,
    name: string,
    label: string
}

const ExternalStoragesContext = React.createContext({});


export const ExternalStoragesProvider = ({children}) => {
    const {data: externalStorages = []} = useAsync(() => axios.get('/api/storages/')
        .then(extractJsonData)
        .catch(handleHttpError('Connection error.')));

    return (
        <ExternalStoragesContext.Provider
            value={{externalStorages}}
        >
            {children}
        </ExternalStoragesContext.Provider>
    );
};

export default ExternalStoragesContext;
