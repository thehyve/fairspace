export const currentWorkspace = () => {
    const segments = window.location.pathname.split('/');
    return ((segments.length > 2 && segments[0] === '' && segments[1] === 'workspaces') && segments[2]) || '';
};

export const workspacePrefix = (workspace: string = currentWorkspace()) => (workspace ? `/workspaces/${workspace}` : '');
