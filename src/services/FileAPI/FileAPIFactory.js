import FileAPI from "./FileAPI";

const factory = {
    build: (collection) => {
        return new FileAPI(collection.location)
    }
}

export default factory;
