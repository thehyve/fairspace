export const LOCAL_STORAGE_MENU_KEY = 'FAIRSPACE_MENU_EXPANDED';
export const CUT = 'CUT';
export const COPY = 'COPY';
export const PATH_SEPARATOR = '/';

// UI
export const LEFT_MENU_EXPANSION_DELAY = 500;
export const MAIN_CONTENT_WIDTH = '55%';
export const SIDE_PANEL_WIDTH = '45%';
export const MAIN_CONTENT_MAX_HEIGHT = 'calc(100vh - 156px)';
export const COLLECTIONS_PATH = '/collections';
export const METADATA_PATH = '/metadata';
export const VOCABULARY_PATH = '/vocabulary';
export const TOOLTIP_ENTER_DELAY = 350;


// Search
export const COLLECTION_SEARCH_TYPE = 'collections';
export const FILES_SEARCH_TYPE = 'files';
export const SEARCH_MAX_SIZE = 10000;
export const SEARCH_DEFAULT_SIZE = 10;
export const SEARCH_DROPDOWN_DEFAULT_SIZE = 100;

// Metadata schemas
export const SHACL_NS = 'http://www.w3.org/ns/shacl#';
export const XMLSCHEMA_NS = 'http://www.w3.org/2001/XMLSchema#';
export const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
export const RDFS_NS = 'http://www.w3.org/2000/01/rdf-schema#';
export const FAIRSPACE_NS = 'http://fairspace.io/ontology#';
export const DASH_NS = 'http://datashapes.org/dash#';
export const RDF_TYPE = RDF_NS + 'type';

// URIs
export const TYPE_URI = RDF_NS + 'type';
export const LABEL_URI = RDFS_NS + 'label';
export const COMMENT_URI = RDFS_NS + 'comment';
export const SUBCLASS_URI = RDFS_NS + 'subClassOf';

export const SHACL_NAME = SHACL_NS + 'name';
export const SHACL_DESCRIPTION = SHACL_NS + 'description';
export const SHACL_PATH = SHACL_NS + 'path';
export const SHACL_TARGET_CLASS = SHACL_NS + 'targetClass';
export const SHACL_PROPERTY = SHACL_NS + 'property';
export const SHACL_CLASS = SHACL_NS + 'class';
export const SHACL_NODE = SHACL_NS + 'node';
export const SHACL_NODEKIND = SHACL_NS + 'nodeKind';
export const SHACL_DATATYPE = SHACL_NS + 'datatype';
export const SHACL_MAX_COUNT = SHACL_NS + 'maxCount';
export const SHACL_MIN_COUNT = SHACL_NS + 'minCount';
export const SHACL_MAX_LENGTH = SHACL_NS + 'maxLength';
export const SHACL_IN = SHACL_NS + 'in';
export const SHACL_IRI = SHACL_NS + 'IRI';
export const SHACL_ORDER = SHACL_NS + 'order';
export const SHACL_PREFIX = SHACL_NS + 'prefix';
export const SHACL_NAMESPACE = SHACL_NS + 'namespace';
export const SHACL_PREFIX_DECLARATION = SHACL_NS + 'PrefixDeclaration';

export const DASH_LIST_SHAPE = DASH_NS + 'ListShape';
export const DASH_SINGLE_LINE = DASH_NS + 'singleLine';

export const STRING_URI = XMLSCHEMA_NS + 'string';
export const BOOLEAN_URI = XMLSCHEMA_NS + 'boolean';
export const DATETIME_URI = XMLSCHEMA_NS + 'dateTime';
export const DATE_URI = XMLSCHEMA_NS + 'date';
export const TIME_URI = XMLSCHEMA_NS + 'time';
export const INTEGER_URI = XMLSCHEMA_NS + 'integer';
export const LONG_URI = XMLSCHEMA_NS + 'long';
export const DECIMAL_URI = XMLSCHEMA_NS + 'decimal';

export const MACHINE_ONLY_URI = FAIRSPACE_NS + 'machineOnly';
export const COLLECTION_URI = FAIRSPACE_NS + 'Collection';
export const FILE_URI = FAIRSPACE_NS + 'File';
export const DIRECTORY_URI = FAIRSPACE_NS + 'Directory';
export const FILE_PATH_URI = FAIRSPACE_NS + 'filePath';
export const FILE_SIZE_URI = FAIRSPACE_NS + 'fileSize';
export const MD5_URI = FAIRSPACE_NS + 'md5';
export const DATE_CREATED_URI = FAIRSPACE_NS + 'dateCreated';
export const CREATED_BY_URI = FAIRSPACE_NS + 'createdBy';
export const DATE_MODIFIED_URI = FAIRSPACE_NS + 'dateModified';
export const MODIFIED_BY_URI = FAIRSPACE_NS + 'modifiedBy';
export const DATE_DELETED_URI = FAIRSPACE_NS + 'dateDeleted';
export const DELETED_BY_URI = FAIRSPACE_NS + 'deletedBy';
export const FIXED_SHAPE_URI = FAIRSPACE_NS + 'fixedShape';
export const EXTERNAL_LINK_URI = FAIRSPACE_NS + 'externalLink';
export const SYSTEM_PROPERTIES_URI = FAIRSPACE_NS + 'systemProperties';
export const RELATION_SHAPE_URI = FAIRSPACE_NS + 'RelationShape';
export const IMPORTANT_PROPERTY_URI = FAIRSPACE_NS + 'importantProperty';
export const DEFAULT_NAMESPACE_URI = FAIRSPACE_NS + 'defaultNamespace';
export const USABLE_IN_METADATA_URI = FAIRSPACE_NS + 'usableInMetadata';
export const USABLE_IN_VOCABULARY_URI = FAIRSPACE_NS + 'usableInVocabulary';

export const NIL_URI = FAIRSPACE_NS + 'nil';
