// Parse path into array
export function parsePath(path) {
    if (!path)
        return [];

    if (path[0] === '/')
        path = path.slice(1);

    return path ? path.split('/') : [];
}

export function uniqueName(fileName, usedNames) {
    if(!usedNames.includes(fileName)) {
        usedNames.push(fileName);
        return fileName;
    }
    const dotPos = fileName.lastIndexOf('.');
    const name = (dotPos >= 0) ? fileName.substring(0, dotPos) : fileName;
    const ext = (dotPos >= 0) ? fileName.substring(dotPos) : '';
    let index = 1;

    while (true) {
        const newName = `${name} (${index})${ext}`;
        if(!usedNames.includes(newName)) {
            usedNames.push(newName);
            return newName;
        }
        index++;
    }
}
