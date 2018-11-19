// Parse path into array
export function parsePath(path) {
    if (!path)
        return [];

    if (path[0] === '/')
        path = path.slice(1);

    return path ? path.split('/') : [];
}
