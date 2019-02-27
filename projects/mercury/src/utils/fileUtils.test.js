import {uniqueName, parentPath, fileName, getDirectoryFromFullpath} from "./fileUtils";

describe('uniqueName', () => {
    it('leaves already unique names untouched', () => {
        const usedNames = [];
        const result = uniqueName('name.ext', usedNames);
        expect(result).toEqual('name.ext');
        expect(usedNames).toEqual(['name.ext']);
    });

    it('returns a new name if needed', () => {
        const usedNames = ['name.ext', 'name (1).ext', 'name (2).ext'];
        const result = uniqueName('name.ext', usedNames);
        expect(result).toEqual('name (3).ext');
        expect(usedNames).toEqual(['name.ext', 'name (1).ext', 'name (2).ext', 'name (3).ext']);
    });

    it('works with complex file names', () => {
        const usedNames = ['name.jpg.exe'];
        const result = uniqueName('name.jpg.exe', usedNames);
        expect(result).toEqual('name.jpg (1).exe');
        expect(usedNames).toEqual(['name.jpg.exe', 'name.jpg (1).exe']);
    });
});


describe('parentPath', () => {
   it('determines the parent path', () => {
       expect(parentPath('/aaa/bbb/ccc.ext')).toEqual('/aaa/bbb');
       expect(parentPath('aaa/bbb/ccc.ext')).toEqual('aaa/bbb');
       expect(parentPath('aaa/bbb/')).toEqual('aaa');
       expect(parentPath('/ccc.ext')).toEqual('');
       expect(parentPath('ccc.ext')).toEqual('');
   });
});

describe('fileName', () => {
    it('determines the file name', () => {
        expect(fileName('/aaa/bbb/ccc.ext')).toEqual('ccc.ext');
        expect(fileName('ccc.ext')).toEqual('ccc.ext');
        expect(fileName('aaa/bbb.ext/')).toEqual('bbb.ext');
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
