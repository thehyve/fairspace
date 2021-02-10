import React from 'react';
import useAsync from "../common/hooks/UseAsync";
import {extractJsonData, handleHttpError} from "../common/utils/httpUtils";

export type ExternalStorage = {
    url: string,
    name: string,
    label: string
}

const ExternalStoragesContext = React.createContext({});

export const mockGetStorages: Promise<ExternalStorage[]> = () => (
    new Promise(resolve => resolve([
        {
            url: "/api/webdav",
            name: "kdi",
            label: "KDI storage"
        }
    ]))
);

export const ExternalStoragesProvider = ({children}) => {
    // const {data: externalStorages = []} = useAsync(() => axios.get('/api/external-storages/')
    //     .then(extractJsonData)
    //     .catch(handleHttpError('Connection error.')));
    const {data: externalStorages = []} = useAsync(() => mockGetStorages()
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
