// @flow

/**
 * The parameterised type of the react-router-dom match object.
 */
export type Match<P> = {
    /**
     * The params type is based on the path parameters in
     * the matching route, e.g., {workspace: string;} for the path '/workspaces/:workspace'.
     */
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

/**
 * The interface of the react-router-dom history object.
 */
export interface History {
    push: (string) => void;
}
