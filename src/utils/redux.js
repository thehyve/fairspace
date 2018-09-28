
/**
 * Creates a redux action that executes a promise.
 *
 * Please note that any error ocurring in the promise execution will be swallowed and
 * logged to the component. In case of an error there will also be a <type>_REJECTED action
 *
 * The redux-promise-middleware is being used to handle the promise
 * and will emit the corresponding actions: <type>_PENDING, <type>_FULFILLED, <type>_REJECTED
 * @param actionClosure
 * @returns {function(): function(*): (*|Promise<T>)}
 */
export function createErrorHandlingPromiseAction(actionClosure){
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

/**
 * Creates a reducer that can be used when handling asynchronous fetching using redux-promise-middleware
 *
 * This reducer will handle the results of a dispatched promise, and store the results based on a specific key.
 * That key can be based on the action (e.g. the fetched id). If no key is returned (or no function specified)
 * the data will not be stored under the key, but in the root
 *
 * This reducer will handle 4 action types:
 *      <type>_FULFILLED, <type>_PENDING, <type>_REJECTED from redux-promise-middleware
 *      INVALIDATE_<type> to mark the data as invalidated
 *
 * The resulting structure will look like this:
 * {
 *     [key]: {
 *          pending: <boolean>      - Whether the request is pending
 *          error: <boolean>        - Whether an error occurred
 *          invalidated: <boolean>  - Whether the data in this object is invalidated
 *          data: <Any>             - Result of the dispatched promise on success
 *    }
 * }
 *
 * @param type The type that is used when dispatching the promise.
 * @param getKeyFromAction A method to retrieve the key to store data under, based on the action
 * @returns {Function}
 */
export const createFetchPromiseReducer = (type, defaultState = {}, getKeyFromAction = () => undefined) => (state = defaultState, action) => {
    const mergeState = (newState, key) => {
        if(key) {
            return {
                ...state,
                [key]: {
                    ...state[key],
                    ...newState
                }
            }
        } else {
            return {
                ...state,
                ...newState
            }

        }
    }

    switch (action.type) {
        case type + "_PENDING":
            return mergeState(
                {
                    pending: true,
                    error: false,
                    data: undefined
                },
                getKeyFromAction(action)
            )
        case type + "_FULFILLED":
            return mergeState(
                {
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: action.payload
                },
                getKeyFromAction(action)
            )
        case type + "_REJECTED":
            return mergeState(
                {
                    pending: false,
                    error: action.payload || true
                },
                getKeyFromAction(action)
            )
        case "INVALIDATE_" + type:
            return mergeState(
                {
                    invalidated: true
                },
                getKeyFromAction(action)
            )
        default:
            return state;
    }
}
