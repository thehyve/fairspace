import {useCallback, useEffect, useState} from "react";
import MetadataViewAPI from "./MetadataViewAPI";


const useViewData = (view, filters, page, rowsPerPage) => {
    const [data = {}, setData] = useState();
    const [count, setCount] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    const refresh = useCallback(() => (
        MetadataViewAPI.getViewData(view, page, rowsPerPage, filters))
        .then(d => {
            setData(d);
            if (d && !d.hasNext) {
                setCount(d.rows.length + (page * rowsPerPage));
            } else {
                MetadataViewAPI.getCount(view, filters).then(res => setCount(res.count));
            }
            setError(undefined);
        })
        .catch((e) => {
            setError(e || true);
            console.error(e || new Error('Unknown error'));
        })
        .finally(() => setLoading(false)), [view, filters, page, rowsPerPage]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {refresh();}, [view, filters, page, rowsPerPage]);

    return {
        data,
        count,
        loading,
        error,
        refresh
    };
};

export default useViewData;
