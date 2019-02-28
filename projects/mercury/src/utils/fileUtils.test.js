import {addCounterToFilename, getFileName, getDirectoryFromFullpath, getParentPath, getUniqueName} from "./fileUtils";

describe('getUniqueName', () => {
    it('leaves already unique names untouched', () => {
        const usedNames = [];
        const result = getUniqueName('name.ext', usedNames);
        expect(result).toEqual('name.ext');
        expect(usedNames).toEqual(['name.ext']);
    });

    it('returns a new name if needed', () => {
        const usedNames = ['name.ext', 'name (1).ext', 'name (2).ext'];
        const result = getUniqueName('name.ext', usedNames);
        expect(result).toEqual('name (3).ext');
        expect(usedNames).toEqual(['name.ext', 'name (1).ext', 'name (2).ext', 'name (3).ext']);
    });

    it('works with complex file names', () => {
        const usedNames = ['name.jpg.exe'];
        const result = getUniqueName('name.jpg.exe', usedNames);
        expect(result).toEqual('name.jpg (1).exe');
        expect(usedNames).toEqual(['name.jpg.exe', 'name.jpg (1).exe']);
    });
});


describe('getParentPath', () => {
    it('determines the parent path', () => {
        expect(getParentPath('/aaa/bbb/ccc.ext')).toEqual('/aaa/bbb');
        expect(getParentPath('aaa/bbb/ccc.ext')).toEqual('aaa/bbb');
        expect(getParentPath('aaa/bbb/')).toEqual('aaa');
        expect(getParentPath('/ccc.ext')).toEqual('');
        expect(getParentPath('ccc.ext')).toEqual('');
    });
});

describe('getFileName', () => {
    it('determines the file name', () => {
        expect(getFileName('aaa/xxx.something.ext')).toEqual('xxx.something.ext');
        expect(getFileName('/aaa/xxx.something.ext')).toEqual('xxx.something.ext');
        expect(getFileName('/aaa/bbb/ccc.ext')).toEqual('ccc.ext');
        expect(getFileName('ccc.ext')).toEqual('ccc.ext');
        expect(getFileName('aaa/bbb.ext/')).toEqual('bbb.ext');
        expect(getFileName('aaa/bbb')).toEqual('bbb');
    });
});

describe('getDirectoryFromFullpath', () => {
    it('gets the directory from the full path', () => {
        expect(getDirectoryFromFullpath('/my-collection/sub-directory')).toEqual('/sub-directory');
        expect(getDirectoryFromFullpath('/my-collection/sub-directory/nested/others.txt')).toEqual('/sub-directory/nested/others.txt');
        expect(getDirectoryFromFullpath('/my-collection')).toEqual('/');
    });

    it('allows the path not to have a leading slash', () => {
        expect(getDirectoryFromFullpath('my-collection/sub-directory')).toEqual('/sub-directory');
        expect(getDirectoryFromFullpath('my-collection/sub-directory/nested/others.txt')).toEqual('/sub-directory/nested/others.txt');
        expect(getDirectoryFromFullpath('my-collection')).toEqual('/');
    });
});

describe('addCounterToFilename', () => {
    it('Adds a counter if there is no one', () => {
        expect(addCounterToFilename('/some/path/file.ext')).toEqual('/some/path/file (2).ext');
        expect(addCounterToFilename('/some/path/file')).toEqual('/some/path/file (2)');
    });

    it('Increments a counter if there is one already', () => {
        expect(addCounterToFilename('/some/path/file (123).ext')).toEqual('/some/path/file (124).ext');
        expect(addCounterToFilename('/some/path/file (123)')).toEqual('/some/path/file (124)');
    });
});
