import {uniqueName, parentPath, fileName} from "./fileUtils";

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
