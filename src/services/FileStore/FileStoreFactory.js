import FileStore from "./FileStore";

const factory = {
    build: (collection) => {
        return new FileStore(collection.location)
    }
}

export default factory;
