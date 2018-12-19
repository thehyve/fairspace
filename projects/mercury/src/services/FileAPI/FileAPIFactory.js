import FileAPI from "./FileAPI";

const factory = {
    build: collection => new FileAPI(collection.location)
};

export default factory;
