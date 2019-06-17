package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class FS {
    public static final String NS = "http://fairspace.io/ontology#";

    public static final String COLLECTION_URI = NS + "Collection";
    public static final Resource Collection = createResource(COLLECTION_URI);

    public static final String DIRECTORY_URI = NS + "Directory";
    public static final Resource Directory = createResource(DIRECTORY_URI);

    public static final String FILE_URI = NS + "File";
    public static final Resource File = createResource(FILE_URI);

    public static final String USER_URI = NS + "User";
    public static final Resource User = createResource(USER_URI);

    public static final String CREATED_BY_URI = NS + "createdBy";
    public static final Property createdBy = createProperty(CREATED_BY_URI);

    public static final String DATE_CREATED_URI = NS + "dateCreated";
    public static final Property dateCreated = createProperty(DATE_CREATED_URI);

    public static final String MODIFIED_BY_URI = NS + "modifiedBy";
    public static final Property modifiedBy = createProperty(MODIFIED_BY_URI);

    public static final String DATE_MODIFIED_URI = NS + "dateModified";
    public static final Property dateModified = createProperty(DATE_MODIFIED_URI);

    public static final String DELETED_BY_URI = NS + "deletedBy";
    public static final Property deletedBy = createProperty(DELETED_BY_URI);

    public static final String DATE_DELETED_URI = NS + "dateDeleted";
    public static final Property dateDeleted = createProperty(DATE_DELETED_URI);

    public static final String EMAIL_URI = NS + "email";
    public static final Property email = createProperty(EMAIL_URI);

    public static final String FILE_PATH_URI = NS + "filePath";
    public static final Property filePath = createProperty(FILE_PATH_URI);

    public static final String FILE_SIZE_URI = NS + "fileSize";
    public static final Property fileSize = createProperty(FILE_SIZE_URI);

    public static final String MD5_URI = NS + "md5";
    public static final Property md5 = createProperty(MD5_URI);

    public static final String COLLECTION_TYPE_URI = NS + "collectionType";
    public static final Property collectionType = createProperty(COLLECTION_TYPE_URI);

    public static final String MACHINE_ONLY_URI = NS + "machineOnly";
    public static final Property machineOnly = createProperty(MACHINE_ONLY_URI);

    public static final String READ_URI = NS + "read";
    public static final Property read = createProperty(READ_URI);

    public static final String WRITE_URI = NS + "write";
    public static final Property write = createProperty(WRITE_URI);

    public static final String MANAGE_URI = NS + "manage";
    public static final Property manage = createProperty(MANAGE_URI);

    public static final String WRITE_RESTRICTED_URI = NS + "writeRestricted";
    public static final Property writeRestricted = createProperty(WRITE_RESTRICTED_URI);

    public static final String CLASS_SHAPE_META_SHAPE_URI = NS + "ClassShapeMetaShape";
    public static final Resource ClassShapeMetaShape = createResource(CLASS_SHAPE_META_SHAPE_URI);

    public static final String PROPERTY_SHAPE_META_SHAPE_URI = NS + "PropertyShapeMetaShape";
    public static final Resource PropertyShapeMetaShape = createResource(PROPERTY_SHAPE_META_SHAPE_URI);

    public static final String RELATION_SHAPE_META_SHAPE_URI = NS + "RelationShapeMetaShape";
    public static final Resource RelationShapeMetaShape = createResource(RELATION_SHAPE_META_SHAPE_URI);

    public static final String CLASS_SHAPE_URI = NS + "ClassShape";
    public static final Resource ClassShape = createResource(CLASS_SHAPE_URI);

    public static final String PROPERTY_SHAPE_URI = NS + "PropertyShape";
    public static final Resource PropertyShape = createResource(PROPERTY_SHAPE_URI);

    public static final String RELATION_SHAPE_URI = NS + "RelationShape";
    public static final Resource RelationShape = createResource(RELATION_SHAPE_URI);

    public static final String INVERSE_RELATION_URI = NS + "inverseRelation";
    public static final Property inverseRelation = createProperty(INVERSE_RELATION_URI);

    public static final String IMPORTANT_PROPERTY_URI = NS + "importantProperty";
    public static final Property importantProperty = createProperty(IMPORTANT_PROPERTY_URI);
}

