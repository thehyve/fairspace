import React, {useCallback} from "react";
import {LoadingInlay, MessageDisplay, useAsync} from "@fairspace/shared-frontend";
import {VocabularyAPI} from "./LinkedDataAPI";
import NetworkGraphVisualization from "../common/components/NetworkGraphVisualization";

export default () => {
    const {data, error, loading} = useAsync(useCallback(() => VocabularyAPI.graph(), []));

    if (loading) {
        return <LoadingInlay />;
    }

    if (error) {
        return <MessageDisplay message="An error occurred while loading vocabulary graph data" />;
    }

    return <NetworkGraphVisualization style={{height: 'calc(100vh - 300px)', minHeight: 200, maxHeight: 500}} network={data} />;
};
