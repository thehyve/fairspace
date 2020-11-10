import {Grain, AssignmentInd, Assignment} from "@material-ui/icons";
import React from "react";
import type {MetadataViewOptions} from "./MetadataViewAPI";

export const applyViewIcons = (views: MetadataViewOptions[]): MetadataViewOptions[] => views.map(view => {
    let icon = <Assignment />;
    if (view.name === 'subjects') {
        icon = <AssignmentInd />;
    } else if (view.name === 'samples') {
        icon = <Grain />;
    }
    return {...view, icon};
});
