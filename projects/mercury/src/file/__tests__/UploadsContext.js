import React from 'react';

import {mount} from "enzyme";
import {act} from "@testing-library/react";
import UploadsContext, {UPLOAD_STATUS_FINISHED, UPLOAD_STATUS_IN_PROGRESS, UploadsProvider} from "../UploadsContext";
import {LocalFileAPI} from "../FileAPI";

const getUploadsProviderValue = props => {
    let contextValue;

    act(() => {
        mount(
            <UploadsProvider {...props}>
                <UploadsContext.Consumer>
                    {value => { contextValue = value; }}
                </UploadsContext.Consumer>
            </UploadsProvider>
        );
    });

    return () => contextValue;
};

describe('UploadsProvider', () => {
    beforeEach(() => {
        LocalFileAPI.uploadMulti = jest.fn(() => Promise.resolve());
    });

    it('should upload files with default state', async () => {
        const getContext = getUploadsProviderValue();
        let context;

        // List should be empty on start
        context = getContext();
        expect(context.uploads.length).toEqual(0);

        const upload = {files: [{path: 'first.txt'}, {path: 'second.txt'}], id: "upload1", destinationPath: "/"};
        const uploadPromise = act(() => context.startUpload(upload));

        context = getContext();
        expect(context.uploads.length).toEqual(1);
        expect(context.uploads.map(u => u.progress)).toEqual([0]);
        expect(context.uploads.map(u => u.status)).toEqual([UPLOAD_STATUS_IN_PROGRESS]);

        // When the promise has resolved, the status of the selected file should be 'finished'
        await uploadPromise;

        context = getContext();
        expect(context.uploads.find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_FINISHED);
    });

    it('should handle upload errors', async () => {
        const getContext = getUploadsProviderValue({fileApi: {uploadMulti: () => Promise.reject()}});
        let context;

        context = getContext();
        const upload = {files: [{path: 'first.txt'}, {path: 'second.txt'}], id: 'upload2', destinationPath: '/'};
        const uploadPromise = act(() => context.startUpload(upload));

        // Refresh context to get new state
        context = getContext();
        expect(context.uploads.length).toEqual(1);
        expect(context.uploads.map(u => u.progress)).toEqual([0]);
        expect(context.uploads.map(u => u.status)).toEqual([UPLOAD_STATUS_IN_PROGRESS]);

        // Check that the upload remains after failing
        await uploadPromise;
        context = getContext();
        expect(context.uploads.length).toEqual(1);
    });

    it('should remove uploads from list', async () => {
        const getContext = getUploadsProviderValue({fileApi: {uploadMulti: () => Promise.reject()}});
        let context;

        context = getContext();
        const upload = {files: [{path: 'error.txt'}], id: 'upload2', destinationPath: '/'};
        const uploadPromise = act(() => context.startUpload(upload));

        // Check that the upload remains after failing
        await uploadPromise;
        context = getContext();
        expect(context.uploads.length).toEqual(1);

        // Check that the upload can be removed
        context.removeUpload(upload);
        context = getContext();
        expect(context.uploads.length).toEqual(0);
    });

    it('should store upload progress', async () => {
        const fileApi = {
            uploadMulti: (destination, files, maxFileSizeBytes, onProgress) => new Promise(resolve => {
                // Set progress to 50 on start
                onProgress({loaded: 1024, total: 2048});

                setTimeout(() => {
                    // Set progress to 100 on finish
                    onProgress({loaded: 2048, total: 2048});
                    resolve();
                }, 50);
            })
        };

        const getContext = getUploadsProviderValue({fileApi});
        let context;

        context = getContext();

        const upload = {files: [{path: 'first.txt'}, {path: 'second.txt'}], id: 'upload2', destinationPath: '/'};
        const uploadPromise = act(() => context.startUpload(upload));

        // Refresh context to get new state
        context = getContext();

        // Verify the upload progress, which should be set to 50%
        expect(context.uploads.find(u => u.file === upload.file).progress).toEqual(50);

        // When the promise has resolved, the status of the selected file should be 'finished'
        await uploadPromise;

        context = getContext();
        expect(context.uploads.find(u => u.file === upload.file).progress).toEqual(100);
        expect(context.uploads.find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_FINISHED);
    });
});
