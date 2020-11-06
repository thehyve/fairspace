import {Grain} from "@material-ui/icons";
import React from "react";

export const applyViewIcons = views => views.map(view => ({...view, icon: <Grain />}));
