import {LOCAL_STORAGE_MENU_KEY} from "./menuStateInLocalStorage";

const initializeState = () => {
    // Set the default value for menuExpanded based on the value from local storage
    // Localstorage stores values as strings. As the default is true
    // we only check whether the value is explicitly set to 'false'
    const menuExpanded = window.localStorage.getItem(LOCAL_STORAGE_MENU_KEY);

    return {
        ui: {
            menuExpanded: menuExpanded !== 'false',
            pending: {}
        }
    };
};

export default initializeState;
