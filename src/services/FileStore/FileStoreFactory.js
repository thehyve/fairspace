import FileStore from "./FileStore";

const factory = {
    build: (collection) => {
        return new FileStore(collection.typeIdentifier)
    }
}

export default factory;