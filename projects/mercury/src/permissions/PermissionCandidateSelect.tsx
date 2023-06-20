// @ts-nocheck
import React from "react";
import Dropdown from "../metadata/common/values/Dropdown";
import { getDisplayName } from "../users/userUtils";
import { compareBy } from "../common/utils/genericUtils";

const PermissionCandidateSelect = ({
  filter = () => true,
  permissionCandidates = [],
  ...otherProps
}) => {
  const options = permissionCandidates.filter(filter).sort(compareBy('name')).map(permission => ({
    label: getDisplayName(permission),
    description: permission.username,
    ...permission
  }));
  return <Dropdown {...otherProps} clearTextOnSelection={false} options={options} />;
};

export default PermissionCandidateSelect;