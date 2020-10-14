import {
    decodePath,
    encodePath,
    generateUniqueFileName,
    getBaseNameAndExtension,
    getFileName,
    getParentPath,
    getPathInfoFromParams
} from '../fileUtils';

describe('getBaseNameAndExtension', () => {
    it('should return the expected file base name and extension', () => {
        expect(getBaseNameAndExtension()).toEqual({baseName: '', extension: ''});
        expect(getBaseNameAndExtension(undefined)).toEqual({baseName: '', extension: ''});
        expect(getBaseNameAndExtension(null)).toEqual({baseName: '', extension: ''});
        expect(getBaseNameAndExtension('name.ext')).toEqual({baseName: 'name', extension: '.ext'});
        expect(getBaseNameAndExtension('name.xxx.ext')).toEqual({baseName: 'name.xxx', extension: '.ext'});
        expect(getBaseNameAndExtension('name.')).toEqual({baseName: 'name', extension: '.'});
        expect(getBaseNameAndExtension('name')).toEqual({baseName: 'name', extension: ''});
        expect(getBaseNameAndExtension('name. xxx.')).toEqual({baseName: 'name. xxx', extension: '.'});
        expect(getBaseNameAndExtension('name. xxx.ext')).toEqual({baseName: 'name. xxx', extension: '.ext'});
        expect(getBaseNameAndExtension('.hidden')).toEqual({baseName: '.hidden', extension: ''});
    });
});

describe('generateUniqueFileName', () => {
    it('leaves already unique names untouched', () => {
        const usedNames = [];
        const result = generateUniqueFileName('name.ext', usedNames);
        expect(result).toEqual('name.ext');
        expect(usedNames).toEqual([]);
    });

    it('leaves already unique names untouched (undefined used names)', () => {
        const result = generateUniqueFileName('name.ext', undefined);
        expect(result).toEqual('name.ext');
    });

    it('returns a new name if needed', () => {
        const usedNames = ['name.ext', 'name (1).ext', 'name (2).ext'];
        const result = generateUniqueFileName('name.ext', usedNames);
        expect(result).toEqual('name (3).ext');
        expect(usedNames).toEqual(['name.ext', 'name (1).ext', 'name (2).ext']);
    });

    it('works with complex file names', () => {
        const usedNames = ['name.jpg.exe'];
        const result = generateUniqueFileName('name.jpg.exe', usedNames);
        expect(result).toEqual('name.jpg (1).exe');
        expect(usedNames).toEqual(['name.jpg.exe']);
    });

    it('works with file names with no extesnsions', () => {
        const usedNames = ['name', 'name.ext'];
        const result = generateUniqueFileName('name', usedNames);
        expect(result).toEqual('name (1)');
        expect(usedNames).toEqual(['name', 'name.ext']);
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

describe('getPathInfoFromParams', () => {
    it('gets path info properly', () => {
        expect(getPathInfoFromParams({collection: '', path: ''})).toEqual({
            collectionName: '',
            openedPath: '/'
        });

        expect(getPathInfoFromParams({collection: undefined, path: undefined})).toEqual({
            collectionName: '',
            openedPath: '/'
        });

        expect(getPathInfoFromParams({collection: 'collectionX', path: 'something/something'})).toEqual({
            collectionName: 'collectionX',
            openedPath: '/collectionX/something/something'
        });
    });
});

describe('encodePath', () => {
    it('encodes the path', () => {
        expect(encodePath('aaa/abc$/d&s##a')).toEqual('aaa/abc%24/d%26s%23%23a');
        expect(encodePath('test name')).toEqual('test%20name');
        expect(encodePath('/?/test')).toEqual('/%3F/test');
        expect(encodePath('/x.1/x_y-_.!~*()')).toEqual('/x.1/x_y-_.!~*()');
        expect(encodePath(';,/?:@&=+$')).toEqual('%3B%2C/%3F%3A%40%26%3D%2B%24');
    });
});

describe('decodePath', () => {
    it('decodes the path', () => {
        expect(decodePath('aaa/abc%24/d%26s%23%23a')).toEqual('aaa/abc$/d&s##a');
        expect(decodePath('test%20name')).toEqual('test name');
        expect(decodePath('/%3F/test')).toEqual('/?/test');
        expect(decodePath('/x.1/x_y-_.!~*()')).toEqual('/x.1/x_y-_.!~*()');
        expect(decodePath('%3B%2C/%3F%3A%40%26%3D%2B%24')).toEqual(';,/?:@&=+$');
    });
});
