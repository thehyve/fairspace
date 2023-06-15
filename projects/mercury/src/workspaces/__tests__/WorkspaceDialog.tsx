// @ts-nocheck
// @ts-nocheck
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { configure, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import WorkspaceDialog from "../WorkspaceDialog";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../App.theme";
// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({
  adapter: new Adapter()
});
let onSubmit;
let onClose;
let workspaceDialog;
let wrapper;

const enterValue = value => {
  const nameField = wrapper.find('input#code').first();
  nameField.simulate('focus');
  nameField.simulate('change', {
    target: {
      value
    }
  });
};

beforeEach(() => {
  onSubmit = jest.fn();
  onClose = jest.fn();
  workspaceDialog = <ThemeProvider theme={theme}>
            <WorkspaceDialog onSubmit={onSubmit} onClose={onClose} creating={false} workspaces={[{
      code: "w1"
    }]} />
        </ThemeProvider>;
  wrapper = mount(workspaceDialog);
});
describe('WorkspaceDialog', () => {
  it('should enable and disable submit button at proper times', () => {
    expect(wrapper.find('[data-testid="submit-button"]').first().prop('disabled')).toBe(true);
    enterValue('a');
    expect(wrapper.find('[data-testid="submit-button"]').first().prop('disabled')).toBe(false);
  });
  it('should send all entered parameters to the creation method', () => {
    enterValue('a');
    const submitButton = wrapper.find('button').first();
    submitButton.simulate('click');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      code: 'a'
    });
  });
  it('should require unique workspace code', () => {
    enterValue('w1');
    const submitButton = wrapper.find('[data-testid="submit-button"]').first();
    expect(submitButton.prop('disabled')).toBe(true);
  });
  it('should warn if workspace code is too long', () => {
    enterValue('w123456789');
    expect(wrapper.text().includes('Warning!')).toBe(false);
    enterValue('w123456789+');
    expect(wrapper.text().includes('Warning!')).toBe(true);
  });
});