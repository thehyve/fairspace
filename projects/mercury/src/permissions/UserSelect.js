import React, {useContext, useRef} from "react";

import Dropdown from "../metadata/common/values/Dropdown";
import {UsersContext} from "../common";

const UserSelect = ({debounce = 300, ...otherProps}) => {
    const {users} = useContext(UsersContext);

    const options = users.map(user => {
                const {iri, name} = user;
                return {
                    label: name,
                    iri,
                    user
                };
            });

    return (
        <Dropdown
            {...otherProps}
            clearTextOnSelection={false}
            options={options}
        />
    );
};

export default UserSelect;
