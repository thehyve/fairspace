import React from 'react';

import {mount} from "enzyme";
import {act} from "@testing-library/react";
import UploadsContext, {
    UPLOAD_STATUS_ERROR,
    UPLOAD_STATUS_FINISHED,
    UPLOAD_STATUS_IN_PROGRESS,
    UPLOAD_STATUS_INITIAL,
    UploadsProvider
} from "../UploadsContext";

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
    it('should enqueue uploads with default state', () => {
        const getContext = getUploadsProviderValue();
        let context;

        // List should be empty on start
        context = getContext();
        expect(context.getUploads().length).toEqual(0);

        act(() => {
            context.enqueueUploads([
                {file: 'first.txt'},
                {file: 'second.txt'}
            ]);
        });

        context = getContext();
        expect(context.getUploads().length).toEqual(2);

        // List should contain both files that were enqueued
        expect(context.getUploads().map(u => u.progress)).toEqual([0, 0]);
        expect(context.getUploads().map(u => u.status)).toEqual([UPLOAD_STATUS_INITIAL, UPLOAD_STATUS_INITIAL]);
    });

    it('should change state for uploads on start', async () => {
        const getContext = getUploadsProviderValue({fileApi: {uploadMulti: () => Promise.resolve()}});
        let context;

        context = getContext();

        act(() => {
            context.enqueueUploads([
                {file: 'first.txt', destinationFilename: 'first.txt', destinationPath: '/'},
                {file: 'second.txt', destinationFilename: 'second.txt', destinationPath: '/'}
            ]);
        });

        // Refresh context to get new state
        context = getContext();

        const upload = context.getUploads()[0];

        const uploadPromise = act(() => context.startUpload(upload));

        // Refresh context to get new state
        context = getContext();

        // Make sure the selected file is being uploaded, while the other one remains pending
        expect(context.getUploads().find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_IN_PROGRESS);
        expect(context.getUploads().find(u => u.file !== upload.file).status).toEqual(UPLOAD_STATUS_INITIAL);

        // When the promise has resolved, the status of the selected file should be 'finished'
        await uploadPromise;

        context = getContext();
        expect(context.getUploads().find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_FINISHED);
    });

    it('should handle upload errors', async () => {
        const getContext = getUploadsProviderValue({fileApi: {uploadMulti: () => Promise.reject()}});
        let context;

        context = getContext();

        act(() => {
            context.enqueueUploads([
                {file: 'first.txt', destinationFilename: 'first.txt', destinationPath: '/'},
                {file: 'second.txt', destinationFilename: 'second.txt', destinationPath: '/'}
            ]);
        });

        // Refresh context to get new state
        context = getContext();
        const upload = context.getUploads()[0];
        await act(() => context.startUpload(upload));

        // Check whether the promise rejection is stored in state
        context = getContext();
        expect(context.getUploads().find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_ERROR);
        expect(context.getUploads().find(u => u.file !== upload.file).status).toEqual(UPLOAD_STATUS_INITIAL);
    });

    it('should store upload progress', async () => {
        const fileApi = {
            uploadMulti: (destination, files, onProgress) => new Promise(resolve => {
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

        act(() => {
            context.enqueueUploads([
                {file: 'first.txt', destinationFilename: 'first.txt', destinationPath: '/'},
                {file: 'second.txt', destinationFilename: 'second.txt', destinationPath: '/'}
            ]);
        });

        // Refresh context to get new state and start upload
        context = getContext();
        const upload = context.getUploads()[0];
        const uploadPromise = act(() => context.startUpload(upload));

        // Refresh context to get new state
        context = getContext();

        // Verify the upload progress, which should be set to 50%
        expect(context.getUploads().find(u => u.file === upload.file).progress).toEqual(50);

        // When the promise has resolved, the status of the selected file should be 'finished'
        await uploadPromise;

        context = getContext();
        expect(context.getUploads().find(u => u.file === upload.file).progress).toEqual(100);
        expect(context.getUploads().find(u => u.file === upload.file).status).toEqual(UPLOAD_STATUS_FINISHED);
    });
});
