import React from 'react';
import {mount} from "enzyme";
import ErrorDialog from "../error/ErrorDialog";
import Dialog from '@material-ui/core/Dialog';

it('shows error dialog when no subject provided', () => {
    const wrapper = mount(<ErrorDialog><div id={"1"}>hey</div>
        <div id={"2"}>ola</div></ErrorDialog>);
    ErrorDialog.showError("test", "Fail test");
    const resultHeader = wrapper.find(Dialog);
    expect(resultHeader.length).toEqual(1);
    expect(resultHeader.text()).toEqual("report_problemAn error has occurredFail testDismiss");
});
