import AccountAPI from '../services/AccountAPI/AccountAPI'

export const fetchUser = () => dispatch =>
    dispatch({
        type: "USER",
        payload: AccountAPI.getUser()
    }).catch(e => {
        // In general, the error will be handled by the component that works with
        // the data. However, to avoid problems with uncaught exceptions, these
        // are handled explicitly
        console.error(e);
    });

export const fetchAuthorizations = () => dispatch =>
    dispatch({
        type: "AUTHORIZATIONS",
        payload: AccountAPI.getAuthorizations()
    }).catch(e => {
        // In general, the error will be handled by the component that works with
        // the data. However, to avoid problems with uncaught exceptions, these
        // are handled explicitly
        console.error(e);
    });