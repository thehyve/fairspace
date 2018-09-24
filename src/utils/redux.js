
/**
 * Creates a redux action that executes a promise.
 * The redux-promise-middleware is being used to handle the promise
 * and will emit the corresponding actions: <type>_PENDING, <type>_FULFILLED, <type>_REJECTED
 * @param actionClosure
 * @returns {function(): function(*): (*|Promise<T>)}
 */
export function createPromiseAction(actionClosure){
    return (...params) => dispatch =>
        dispatch(
            actionClosure(...params, dispatch)
        ).catch(e => {
                // In general, the error will be handled by the component that works with
                // the data. However, to avoid problems with uncaught exceptions, these
                // are handled explicitly
                console.error(e);
            })
}
