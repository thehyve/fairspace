export const LOCAL_STORAGE_MENU_KEY = 'FAIRSPACE_MENU_EXPANDED';
export const CUT = 'CUT';
export const COPY = 'COPY';
export const PATH_SEPARATOR = '/';

// UI
export const MAIN_CONTENT_WIDTH = '55%';
export const SIDE_PANEL_WIDTH = '45%';
export const MAIN_CONTENT_MAX_HEIGHT = '65vh';

// Search
export const COLLECTION_SEARCH_TYPE = 'collections';
export const FILES_SEARCH_TYPE = 'files';

// Metadata schemas
export const SHACL_NS = 'http://www.w3.org/ns/shacl#';
export const XMLSCHEMA_NS = 'http://www.w3.org/2001/XMLSchema#';
export const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
export const RDFS_NS = 'http://www.w3.org/2000/01/rdf-schema#';
export const FAIRSPACE_NS = 'http://fairspace.io/ontology#';


// URIs
export const TYPE_URI = RDF_NS + 'type';
export const LABEL_URI = RDFS_NS + 'label';
export const COMMENT_URI = RDFS_NS + 'comment';

export const SHACL_NAME = SHACL_NS + 'name';
export const SHACL_DESCRIPTION = SHACL_NS + 'description';
export const SHACL_PATH = SHACL_NS + 'path';
export const SHACL_TARGET_CLASS = SHACL_NS + 'targetClass';
export const SHACL_PROPERTY = SHACL_NS + 'property';
export const SHACL_CLASS = SHACL_NS + 'class';
export const SHACL_DATATYPE = SHACL_NS + 'datatype';
export const SHACL_MAX_COUNT = SHACL_NS + 'maxCount';
export const SHACL_MAX_LENGTH = SHACL_NS + 'maxLength';
export const SHACL_IN = SHACL_NS + 'in';

export const STRING_URI = XMLSCHEMA_NS + 'string';
export const BOOLEAN_URI = XMLSCHEMA_NS + 'boolean';
export const DATETIME_URI = XMLSCHEMA_NS + 'dateTime';
export const DATE_URI = XMLSCHEMA_NS + 'date';
export const TIME_URI = XMLSCHEMA_NS + 'time';
export const INTEGER_URI = XMLSCHEMA_NS + 'integer';
export const DECIMAL_URI = XMLSCHEMA_NS + 'decimal';
export const RESOURCE_URI = RDFS_NS + 'Resource';

export const MACHINE_ONLY_URI = FAIRSPACE_NS + 'machineOnly';
export const SHOW_IN_CATALOG_URI = FAIRSPACE_NS + 'showInCatalog';
export const COLLECTION_URI = FAIRSPACE_NS + 'Collection';
export const FILE_URI = FAIRSPACE_NS + 'File';
export const DIRECTORY_URI = FAIRSPACE_NS + 'Directory';
export const FILE_PATH_URI = FAIRSPACE_NS + 'filePath';
export const DATE_DELETED_URI = FAIRSPACE_NS + 'dateDeleted';
export const DELETED_BY_URI = FAIRSPACE_NS + 'deletedBy';
