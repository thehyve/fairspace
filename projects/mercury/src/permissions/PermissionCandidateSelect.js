import React from "react";

import Dropdown from "../metadata/common/values/Dropdown";
import {getDisplayName} from "../users/userUtils";
import {compareBy} from "../common/utils/genericUtils";

const PermissionCandidateSelect = ({filter = () => true, permissionCandidates = [], ...otherProps}) => {
    const options = permissionCandidates
        .filter(filter)
        .sort(compareBy('name'))
        .map(permission => (
            {
                label: getDisplayName(permission),
                ...permission
            }
        ));

    return (
        <Dropdown
            clearTextOnSelection={false}
            {...otherProps}
            options={options}
        />
    );
};

export default PermissionCandidateSelect;
