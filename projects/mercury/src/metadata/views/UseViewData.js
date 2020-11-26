/* eslint-disable react-hooks/exhaustive-deps */
import {useCallback, useEffect, useState} from "react";
import MetadataViewAPI from "./MetadataViewAPI";


const useViewData = (view, filters, page, rowsPerPage) => {
    const [data = {}, setData] = useState();
    const [count, setCount] = useState(-1);
    const [countTimeout, setCountTimeout] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const refreshAll = useCallback(() => (
        MetadataViewAPI.getViewData(view, page, rowsPerPage, filters))
        .then(d => {
            setData(d);
            if (d && !d.hasNext) {
                setCount(d.rows.length + (page * rowsPerPage));
            } else {
                MetadataViewAPI.getCount(view, filters).then(res => {
                    if (res) {
                        if (res.count != null) {
                            setCount(res.count);
                        }
                        setCountTimeout(res.timeout);
                    }
                });
            }
            setError(undefined);
        })
        .catch((e) => {
            setError(e || true);
            console.error(e || new Error('Unknown error'));
        })
        .finally(() => setLoading(false)), [view, filters]);

    const refreshDataOnly = useCallback((newPage, newRowsPerPage) => (
        MetadataViewAPI.getViewData(view, newPage, newRowsPerPage, filters))
        .then(d => {
            setData(d);
            setError(undefined);
        })
        .catch((e) => {
            setError(e || true);
            console.error(e || new Error('Unknown error'));
        })
        .finally(() => setLoading(false)));

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
