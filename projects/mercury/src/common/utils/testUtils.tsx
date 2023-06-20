// @ts-nocheck
import React from "react";
import {mount} from "enzyme";

// TestHook method is borrowed from https://medium.com/@nitinpatel_20236/unit-testing-custom-react-hooks-caa86f58510
const TestHook = ({
    callback
}) => {
    callback();
    return null;
};

export const testHook = callback => {
    mount(<TestHook callback={callback} />);
};