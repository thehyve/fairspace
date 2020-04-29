import React, {useContext} from "react";

import Dropdown from "../metadata/common/values/Dropdown";
import {getDisplayName} from "../users/userUtils";
import UsersContext from "../users/UsersContext";
import {compareBy} from "../common/utils/genericUtils";

const UserSelect = ({filter = () => true, ...otherProps}) => {
    const {users} = useContext(UsersContext);

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
