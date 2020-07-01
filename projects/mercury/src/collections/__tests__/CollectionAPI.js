import CollectionAPI from "../CollectionAPI";
import FileAPI from "../../file/FileAPI";
import PermissionAPI from "../../permissions/PermissionAPI";
import {MetadataAPI} from "../../metadata/common/LinkedDataAPI";
import {RDFS_NS} from "../../constants";

afterEach(() => {
    jest.clearAllMocks();
});

describe('CollectionAPI', () => {
    describe('Retrieving', () => {
        FileAPI.list = jest.fn(() => Promise.resolve(
            [{basename: 'collection1'}, {basename: 'collection2'}, {basename: 'collection3'}]
        ));
        FileAPI.stat = jest.fn(() => Promise.resolve(
            {iri: 'c_iri'}
        ));
        PermissionAPI.getPermissions = jest.fn(() => Promise.resolve(
            [{user: 'user1', canManage: true}]
        ));

        it('retrieves data for collections', async () => {
            const result = await CollectionAPI.getCollections({iri: 'user1'});

            expect(FileAPI.list).toHaveBeenCalledTimes(1);
            expect(FileAPI.list).toHaveBeenCalledWith('', false);

            expect(FileAPI.stat).toHaveBeenCalledTimes(3);
            expect(FileAPI.stat).toHaveBeenCalledWith('collection1');
            expect(FileAPI.stat).toHaveBeenCalledWith('collection2');
            expect(FileAPI.stat).toHaveBeenCalledWith('collection3');

            expect(PermissionAPI.getPermissions).toHaveBeenCalledTimes(3);
            expect(result.map(r => r.iri)).toEqual(['c_iri', 'c_iri', 'c_iri']);
            expect(result.map(r => r.canManage)).toEqual([true, true, true]);
        });

        it('retrieves collections including deleted', async () => {
            await CollectionAPI.getCollections({iri: 'user1'}, true);
            expect(FileAPI.list).toHaveBeenCalledTimes(1);
            expect(FileAPI.list).toHaveBeenCalledWith('', true);
        });
    });

    describe('Adding', () => {
        FileAPI.createDirectory = jest.fn(() => Promise.resolve());
        FileAPI.stat = jest.fn(() => Promise.resolve({iri: 'c_iri'}));
        MetadataAPI.updateEntity = jest.fn(() => Promise.resolve());

        it('makes the proper calls to add a collection', async () => {
            await CollectionAPI.addCollection({
                name: 'name1',
                description: 'description1',
                location: 'location1'
            }, {});

            expect(FileAPI.createDirectory).toHaveBeenCalledTimes(1);

            expect(FileAPI.stat).toHaveBeenCalledTimes(1);
            expect(FileAPI.stat).toHaveBeenCalledWith('location1');

            expect(MetadataAPI.updateEntity).toHaveBeenCalledTimes(1);
            expect(MetadataAPI.updateEntity).toHaveBeenCalledWith(
                'c_iri',
                {
                    [RDFS_NS + 'label']: {value: 'name1'},
                    [RDFS_NS + 'comment']: {value: 'description1'}
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
                    [RDFS_NS + 'label']: {value: 'name1'},
                    [RDFS_NS + 'comment']: {value: 'description1'}
                },
                {}
            );
        });
    });

    describe('Undeleting', () => {
        FileAPI.undelete = jest.fn(() => Promise.resolve());

        it('makes a proper call to undelete a collection', async () => {
            await CollectionAPI.undeleteCollection({
                name: 'name1',
                description: 'description1',
                iri: 'c1'
            }, {});

            expect(FileAPI.undelete).toHaveBeenCalledTimes(1);
            expect(FileAPI.undelete).toHaveBeenCalledWith('name1');
        });
    });


    describe('Deleting', () => {
        FileAPI.delete = jest.fn(() => Promise.resolve());

        it('makes a proper call to delete a collection', async () => {
            await CollectionAPI.deleteCollection({
                name: 'name1',
                description: 'description1',
                iri: 'c1'
            });

            expect(FileAPI.delete).toHaveBeenCalledTimes(1);
            expect(FileAPI.delete).toHaveBeenCalledWith('name1', false);
        });

        it('makes a proper call to delete a collection permanently', async () => {
            await CollectionAPI.deleteCollection({
                name: 'name1',
                description: 'description1',
                iri: 'c1'
            }, true);

            expect(FileAPI.delete).toHaveBeenCalledTimes(1);
            expect(FileAPI.delete).toHaveBeenCalledWith('name1', true);
        });
    });
});
