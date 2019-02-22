import {invalidateFiles} from './filesByCollectionAndPathReducers';

describe('Files by collection and path reducers', () => {
    it('should invalidate files and directories', () => {
        const statePre = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: [
                        {
                            filename: "/Jan_Smit_s_collection-500/dir",
                            basename: "dir",
                            lastmod: "Fri, 22 Feb 2019 10:44:11 GMT",
                            size: 0,
                            type: "directory",
                            etag: "c6da623c69975953c66727672c4e49a5"
                        },
                        {
                            filename: "/Jan_Smit_s_collection-500/temp.json",
                            basename: "temp.json",
                            lastmod: "Fri, 22 Feb 2019 10:52:30 GMT",
                            size: 383,
                            type: "file",
                            etag: "d8a915e453fead8f4b6a03ce98cb3fed",
                            mime: "application/json"
                        }
                    ]
                }
            }
        };

        const stateAfterInvalidation = invalidateFiles(statePre, 'https://workspace.ci.test.fairdev.app/iri/500', '/');
        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: true,
                    data: [
                        {
                            filename: "/Jan_Smit_s_collection-500/dir",
                            basename: "dir",
                            lastmod: "Fri, 22 Feb 2019 10:44:11 GMT",
                            size: 0,
                            type: "directory",
                            etag: "c6da623c69975953c66727672c4e49a5"
                        },
                        {
                            filename: "/Jan_Smit_s_collection-500/temp.json",
                            basename: "temp.json",
                            lastmod: "Fri, 22 Feb 2019 10:52:30 GMT",
                            size: 383,
                            type: "file",
                            etag: "d8a915e453fead8f4b6a03ce98cb3fed",
                            mime: "application/json"
                        }
                    ]
                }
            }
        };

        expect(stateAfterInvalidation).toEqual(expectedState);
    });
});
