import React, {useContext} from "react";

import Dropdown from "../metadata/common/values/Dropdown";
import {UsersContext} from "../common";

const UserSelect = ({filter = () => true, ...otherProps}) => {
    const {users} = useContext(UsersContext);

    const options = users
        .filter(filter)
        .map(user => (
            {
                label: user.name,
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
