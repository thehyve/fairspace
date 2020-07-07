import React from "react";

import Dropdown from "../metadata/common/values/Dropdown";
import {getDisplayName} from "../users/userUtils";
import {compareBy} from "../common/utils/genericUtils";

const UserSelect = ({filter = () => true, users = [], ...otherProps}) => {
    const options = users
        .filter(filter)
        .sort(compareBy('name'))
        .map(user => (
            {
                label: getDisplayName(user),
                ...user
            }
        ));

    return (
        <Dropdown
            {...otherProps}
            clearTextOnSelection={false}
            options={options}
        />
    );
};

export default UserSelect;
