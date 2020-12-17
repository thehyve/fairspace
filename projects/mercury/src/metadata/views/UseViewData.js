/* eslint-disable react-hooks/exhaustive-deps */
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import MetadataViewAPI from "./MetadataViewAPI";
import type {MetadataViewData} from "./MetadataViewAPI";


const useViewData = (view, filters, rowsPerPage) => {
    const [data, setData] = useState({});
    const [count, setCount] = useState(-1);
    const [countTimeout, setCountTimeout] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [countRequestCancelToken, setCountRequestCancelToken] = useState();
    const [viewDataRequestCancelToken, setViewDataRequestCancelToken] = useState();

    const fetchCount = () => {
        if (countRequestCancelToken) {
            countRequestCancelToken.cancel("Fetching count operation canceled due to new request.");
        }
        const token = axios.CancelToken.source();
        setCountRequestCancelToken(token);
        MetadataViewAPI.getCount(token, view, filters).then(res => {
            if (res) {
                if (res.count != null) {
                    setCount(res.count);
                } else {
                    setCount(-1);
                }
                setCountTimeout(res.timeout);
            }
        });
    };

    const getViewData = (newPage: number, newRowsPerPage: number): Promise<MetadataViewData> => {
        if (viewDataRequestCancelToken) {
            viewDataRequestCancelToken.cancel("Fetching data operation canceled due to new request.");
        }
        const token = axios.CancelToken.source();
        setViewDataRequestCancelToken(token);
        return MetadataViewAPI.getViewData(token, view, newPage, newRowsPerPage, filters);
    };

    const refreshAll = useCallback(() => {
        setLoading(true);
        setCount(-1);
        getViewData(0, rowsPerPage)
            .then(d => {
                setData(d);
                if (d && !d.hasNext) {
                    setCount(d.rows.length);
                } else {
                    fetchCount();
                }
                setError(undefined);
            })
            .catch((e) => {
                setError(e || true);
                console.error(e || new Error('Unknown error'));
            })
            .finally(() => setLoading(false));
    }, [view, filters]);

    const refreshDataOnly = useCallback((newPage, newRowsPerPage) => {
        setLoading(true);
        getViewData(newPage, newRowsPerPage).then(d => {
            setData(d);
            setError(undefined);
        })
            .catch((e) => {
                setError(e || true);
                console.error(e || new Error('Unknown error'));
            })
            .finally(() => setLoading(false));
    });


    useEffect(() => {refreshAll();}, [view, filters]);

    return {
        data,
        count,
        countTimeout,
        loading,
        error,
        refreshDataOnly
    };
};

export default useViewData;
