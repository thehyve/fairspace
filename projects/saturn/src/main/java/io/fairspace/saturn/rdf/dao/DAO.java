package io.fairspace.saturn.rdf.dao;

import com.pivovarit.function.ThrowingBiConsumer;
import io.fairspace.saturn.rdf.SparqlUtils;
import lombok.Getter;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.Var;
import org.apache.jena.sparql.modify.request.QuadAcc;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.sparql.modify.request.UpdateDeleteWhere;
import org.apache.jena.update.UpdateRequest;
import org.apache.jena.vocabulary.RDF;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.*;
import static java.lang.String.format;
import static java.time.Instant.now;
import static java.time.Instant.ofEpochMilli;
import static java.util.Collections.singletonList;
import static java.util.Optional.ofNullable;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.elasticsearch.common.inject.internal.MoreTypes.getRawType;

/**
 * A simple Data Access Object for objects extending io.fairspace.saturn.rdf.dao.PersistentEntity.
 * <p>
 * No lazy loading, no caching, no bytecode manipulation - as simple as it can be.
 * Entity classes must be annotated with @io.fairspace.saturn.rdf.dao.RDFType and have a zero-arguments constructor.
 * Each persistent property must be annotated with @io.fairspace.saturn.rdf.dao.RDFProperty.
 * References to other entities should be stored as org.apache.jena.graph.Node values and can be created using
 * org.apache.jena.graph.NodeFactory.createURI
 * <p>
 * <p>
 * Supported field types:
 * - All primitive types and their object wrappers, e.g. java.lang.Long
 * - java.lang.String
 * - java.time.Instant
 * - org.apache.jena.graph.Node
 * - Collections (descendants of java.util.Collection) of the above types.
 * <p>
 * All collection fields must be initialized on object initialization:
 * private final Set<Node> items = new HashSet<>();
 * <p>
 * Lists (java.util.List) can be used, but order of elements is not preserved.
 * <p>
 * Scalar fields can be marked as required (see @RDFProperty), in that case DAO checks if they are initialized during
 * serialization and deserialization and throws a DAOException in case of violation.
 * <p>
 * For LifecycleAwarePersistentEntity's descendants, DAO automatically updates related fields (dateCreated, etc).
 */
public class DAO {
    private static final String NO_VALUE_ERROR = "No value for required field %s in entity %s";
    private static final String UNINITIALIZED_COLLECTION_ERROR = "An uninitialized collection field %s in class %s";
    private static final String NO_RDF_TYPE_ERROR = "No RDF type specified for %s";
    private static final String CASTING_ERROR = "Cannot cast %s to %s";
    private static final String TOO_MANY_VALUES_ERROR = "More than one value for scalar field %s in resource %s";
    private static final String WRONG_ENTITY_TYPE_ERROR = "Entity %s is not of type %s";

    @Getter
    private final Dataset dataset;
    private final Supplier<Node> userIriSupplier;

    public DAO(Dataset dataset, Supplier<Node> userIriSupplier) {
        this.dataset = dataset;
        this.userIriSupplier = userIriSupplier;
    }

    /**
     * Writes (creates or updates) an entity.
     * This method can modify the entity passed as an argument. It it has no IRI it will be automatically assigned.
     * This method also updates the relevant fields of LifecycleAwarePersistentEntity
     *
     * @param entity
     * @param <T>
     * @return the entity passed as an argument
     */
    public <T extends PersistentEntity> T write(T entity) {
        return safely(() -> {
            var type = getRdfType(entity.getClass());

            if (entity instanceof LifecycleAwarePersistentEntity) {
                var basicEntity = (LifecycleAwarePersistentEntity) entity;
                var user = userIriSupplier.get();
                basicEntity.setDateModified(now());
                basicEntity.setModifiedBy(user);

                if (entity.getIri() == null) {
                    basicEntity.setDateCreated(basicEntity.getDateModified());
                    basicEntity.setCreatedBy(user);
                }
            }

            if (entity.getIri() == null) {
                entity.setIri(SparqlUtils.generateMetadataIri());
            }

            var update = new UpdateRequest();

            setProperty(update, entity.getIri(), RDF.type.asNode(), type);

            processFields(entity.getClass(), (field, annotation) -> {
                var propertyNode = createURI(annotation.value());
                var value = field.get(entity);

                if (value == null && annotation.required()) {
                    throw new DAOException(format(NO_VALUE_ERROR, field.getName(), entity.getIri()));
                }

                setProperty(update, entity.getIri(), propertyNode, value);
            });

            update(dataset, update);

            return entity;
        });
    }

    /**
     * Reads an entity
     *
     * @param type
     * @param iri
     * @param <T>
     * @return The found entity or null if no entity was found or it was marked as deleted
     */
    public <T extends PersistentEntity> T read(Class<T> type, Node iri) {
        return construct(type, storedQuery("select_by_mask", defaultGraphIRI, iri, null, null))
                .stream().findFirst().orElse(null);
    }

    /**
     * Deletes an entity
     *
     * @param entity
     */
    public void delete(PersistentEntity entity) {
        delete(entity.getIri());
    }

    /**
     * Deletes an entity
     *
     * @param iri
     */
    public void delete(Node iri) {
        update(dataset, storedQuery("delete_by_mask", defaultGraphIRI, iri, null, null));
    }

    /**
     * Marks an entity as deleted and updates its dateDeleted and deletedBy fields
     *
     * @param entity
     * @return the entity passed as an argument if no entity was found or it was already marked as deleted
     */
    public <T extends LifecycleAwarePersistentEntity> T markAsDeleted(T entity) {
        var existing = (T) read(entity.getClass(), entity.getIri());
        if (existing != null) {
            existing.setDateDeleted(now());
            existing.setDeletedBy(userIriSupplier.get());
            return write(existing);
        }
        return null;

    }

    /**
     * Lists entities of a specific type (except to marked as deleted)
     *
     * @param type
     * @param <T>
     * @return
     */
    public <T extends PersistentEntity> List<T> list(Class<T> type) {
        return construct(type, storedQuery("select_by_type", defaultGraphIRI, getRdfType(type)));
    }

    /**
     * Execustes a SPARQL CONSTRUCT query and lists entities of a specific type (except to marked as deleted)
     * in the resulting model
     *
     * @param type
     * @param query
     * @param <T>
     * @return
     */
    public <T extends PersistentEntity> List<T> construct(Class<T> type, String query) {
        return safely(() -> {
            var model = queryConstruct(dataset, query);
            var entities = new ArrayList<T>();
            Iterable<Resource> subjects = model::listSubjects;
            for (var resource : subjects) {
                var entity = createEntity(type, resource);
                if (entity instanceof LifecycleAwarePersistentEntity && ((LifecycleAwarePersistentEntity) entity).getDateDeleted() != null) {
                    continue;
                }

                entities.add(entity);
            }

            return entities;
        });
    }

    private static <T extends PersistentEntity> T createEntity(Class<T> type, Resource resource) throws Exception {
        var typeResource = createResource(getRdfType(type).getURI());
        if (!resource.hasProperty(RDF.type, typeResource)) {
            throw new DAOException(format(WRONG_ENTITY_TYPE_ERROR, resource.getURI(), typeResource.getURI()));
        }
        var ctor = type.getDeclaredConstructor();
        ctor.setAccessible(true);
        var entity = ctor.newInstance();
        entity.setIri(resource.asNode());
        processFields(type, (field, annotation) -> {
            var property = createProperty(annotation.value());

            var stmts = resource.listProperties(property).toList();

            if (Collection.class.isAssignableFrom(field.getType())) {
                var collection = (Collection) field.get(entity);
                if (collection == null) {
                    throw new DAOException(format(UNINITIALIZED_COLLECTION_ERROR, field.getName(), type.getName()));
                }

                var parameterizedType = (ParameterizedType) field.getGenericType();
                var valueType = getRawType(parameterizedType.getActualTypeArguments()[0]);

                stmts.forEach(stmt -> collection.add(nodeToType(stmt.getObject(), valueType)));
            } else {
                if (stmts.size() > 1) {
                    throw new DAOException(format(TOO_MANY_VALUES_ERROR, field.getName(), resource.getURI()));
                }

                if (!stmts.isEmpty()) {
                    var value = nodeToType(stmts.get(0).getObject(), field.getType());
                    field.set(entity, value);
                } else if (annotation.required()) {
                    throw new DAOException(format(NO_VALUE_ERROR, field.getName(), resource.getURI()));
                }
            }
        });
        return entity;
    }

    private static void processFields(Class<?> type, ThrowingBiConsumer<Field, RDFProperty, Exception> action) throws Exception {
        for (Class<?> c = type; c != null; c = c.getSuperclass()) {
            for (var field : c.getDeclaredFields()) {
                var annotation = field.getAnnotation(RDFProperty.class);
                if (annotation != null) {
                    field.setAccessible(true);
                    action.accept(field, annotation);
                }
            }
        }
    }

    private static void setProperty(UpdateRequest update, Node entityNode, Node propertyNode, Object value) {
        update.add(new UpdateDeleteWhere(new QuadAcc(singletonList(new Quad(
                defaultGraphIRI,
                entityNode,
                propertyNode,
                Var.alloc("o"))))));

        if (value instanceof Iterable) {
            ((Iterable<?>) value).forEach(item -> addProperty(update, entityNode, propertyNode, item));
        } else if (value != null) {
            addProperty(update, entityNode, propertyNode, value);
        }
    }

    private static void addProperty(UpdateRequest update, Node entityNode, Node propertyNode, Object value) {
        update.add(new UpdateDataInsert(new QuadDataAcc(singletonList(new Quad(
                defaultGraphIRI,
                entityNode,
                propertyNode,
                valueToNode(value))))));
    }

    private static Node valueToNode(Object value) {
        if (value instanceof Node) {
            return (Node) value;
        }
        if (value instanceof String) {
            return createStringLiteral(value.toString()).asNode();
        }
        if (value instanceof Instant) {
            var zdt = ZonedDateTime.ofInstant((Instant) value, ZoneId.systemDefault());
            var call = GregorianCalendar.from(zdt);
            return createTypedLiteral(call).asNode();
        }
        return createTypedLiteral(value).asNode();
    }

    private static Node getRdfType(Class<? extends PersistentEntity> type) {
        return ofNullable(type.getAnnotation(RDFType.class))
                .map(annotation -> createURI(annotation.value()))
                .orElseThrow(() -> new DAOException(format(NO_RDF_TYPE_ERROR, type.getName())));
    }

    private static <T> T safely(Callable<T> action) {
        try {
            return action.call();
        } catch (DAOException e) {
            throw e;
        } catch (Exception e) {
            throw new DAOException(e);
        }
    }

    private static Object nodeToType(RDFNode object, Class<?> type) {
        if (type == Node.class) {
            return object.asNode();
        }

        if (object.isLiteral()) {
            var literal = object.asLiteral();
            if (type == String.class) {
                return literal.getString();
            }
            if (type == Double.class || type == double.class) {
                return literal.getDouble();
            }
            if (type == Float.class || type == float.class) {
                return literal.getFloat();
            }
            if (type == Long.class || type == long.class) {
                return literal.getLong();
            }
            if (type == Integer.class || type == int.class) {
                return literal.getInt();
            }
            if (type == Short.class || type == short.class) {
                return literal.getShort();
            }
            if (type == Character.class || type == char.class) {
                return literal.getChar();
            }
            if (type == Byte.class || type == byte.class) {
                return literal.getByte();
            }
            if (type == Boolean.class || type == boolean.class) {
                return literal.getBoolean();
            }
            if (type == Instant.class) {
                return ofEpochMilli(((XSDDateTime) literal.getValue()).asCalendar().getTimeInMillis());
            }
        }

        throw new DAOException(format(CASTING_ERROR, object, type.getName()));
    }
}
