// @ts-nocheck
export const currentWorkspace = () => new URLSearchParams(window.location.search).get('iri');
export const workspacePrefix = (workspace: string = currentWorkspace()) => workspace ? `/workspace?iri=${encodeURI(workspace)}` : '';