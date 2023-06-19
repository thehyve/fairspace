// @ts-nocheck
import React from "react";
import { Assignment } from "@mui/icons-material";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";
import LinkedDataMetadataProvider from "./LinkedDataMetadataProvider";
export const MetadataWrapper = ({
  children
}) => <BreadcrumbsContext.Provider value={{
  segments: [{
    label: 'Metadata',
    href: '/metadata',
    icon: <Assignment />
  }]
}}>
        <LinkedDataMetadataProvider>
            {children}
        </LinkedDataMetadataProvider>
    </BreadcrumbsContext.Provider>;