import CollectionAPI from "../CollectionAPI";
import {LocalFileAPI} from "../../file/FileAPI";
import MetadataAPI from "../../metadata/common/MetadataAPI";
import {RDFS_NS} from "../../constants";

afterEach(() => {
    jest.clearAllMocks();
});

describe('CollectionAPI', () => {
    describe('Retrieving', () => {
        LocalFileAPI.list = jest.fn(() => Promise.resolve(
            [{basename: 'collection1'}, {basename: 'collection2'}, {basename: 'collection3'}]
        ));
        LocalFileAPI.stat = jest.fn(() => Promise.resolve(
            {iri: 'c_iri'}
        ));

        it('retrieves data for collections', async () => {
            await CollectionAPI.getCollections();

            expect(LocalFileAPI.list).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.list).toHaveBeenCalledWith('', false);

            expect(LocalFileAPI.stat).toHaveBeenCalledTimes(0);
        });

        it('retrieves collections including deleted', async () => {
            await CollectionAPI.getCollections(true);
            expect(LocalFileAPI.list).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.list).toHaveBeenCalledWith('', true);
        });
    });

    describe('Adding', () => {
        LocalFileAPI.createDirectory = jest.fn(() => Promise.resolve());
        LocalFileAPI.stat = jest.fn(() => Promise.resolve({iri: 'c_iri'}));
        MetadataAPI.updateEntity = jest.fn(() => Promise.resolve());

        it('makes the proper calls to add a collection', async () => {
            await CollectionAPI.addCollection({
                name: 'name1',
                description: 'description1'
            }, {});

            expect(LocalFileAPI.createDirectory).toHaveBeenCalledTimes(1);

            expect(LocalFileAPI.stat).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.stat).toHaveBeenCalledWith('name1');

            expect(MetadataAPI.updateEntity).toHaveBeenCalledTimes(1);
            expect(MetadataAPI.updateEntity).toHaveBeenCalledWith(
                'c_iri',
                {
                    [RDFS_NS + 'comment']: [{value: 'description1'}]
                },
                {}
            );
        });
    });

    describe('Updating', () => {
        MetadataAPI.updateEntity = jest.fn(() => Promise.resolve());

        it('makes a proper call to update a collection', async () => {
            await CollectionAPI.updateCollection({
                name: 'name1',
                description: 'description1',
                iri: 'c1'
            }, {});

            expect(MetadataAPI.updateEntity).toHaveBeenCalledTimes(1);
            expect(MetadataAPI.updateEntity).toHaveBeenCalledWith(
                'c1',
                {
                    [RDFS_NS + 'comment']: [{value: 'description1'}]
                },
                {}
            );
        });
    });

    describe('Undeleting', () => {
        LocalFileAPI.undelete = jest.fn(() => Promise.resolve());

        it('makes a proper call to undelete a collection', async () => {
            await CollectionAPI.undeleteCollection({
                name: 'name 1',
                description: 'description1',
                iri: 'c1'
            }, {});

            expect(LocalFileAPI.undelete).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.undelete).toHaveBeenCalledWith('name 1');
        });
    });

    describe('Deleting', () => {
        LocalFileAPI.delete = jest.fn(() => Promise.resolve());

        it('makes a proper call to delete a collection', async () => {
            await CollectionAPI.deleteCollection({
                name: 'name 1',
                description: 'description1',
                iri: 'c1'
            });

            expect(LocalFileAPI.delete).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.delete).toHaveBeenCalledWith('name 1', false);
        });

        it('makes a proper call to delete a collection permanently', async () => {
            await CollectionAPI.deleteCollection({
                name: 'name 1',
                description: 'description1',
                iri: 'c1'
            }, true);

            expect(LocalFileAPI.delete).toHaveBeenCalledTimes(1);
            expect(LocalFileAPI.delete).toHaveBeenCalledWith('name 1', true);
        });
    });
});
