package io.fairspace.saturn.rdf.beans;

import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadAcc;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.sparql.modify.request.UpdateDeleteWhere;
import org.apache.jena.update.UpdateRequest;
import org.apache.jena.vocabulary.RDF;

import java.lang.reflect.ParameterizedType;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.concurrent.Callable;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.time.Instant.ofEpochMilli;
import static java.util.Collections.singletonList;
import static java.util.Optional.ofNullable;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.graph.NodeFactory.createVariable;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.elasticsearch.common.inject.internal.MoreTypes.getRawType;

public class BeanPersister {
    private static final Property DATE_DELETED = createProperty("http://fairspace.io/ontology#dateDeleted");
    private final RDFConnection rdf;

    public BeanPersister(RDFConnection rdf) {
        this.rdf = rdf;
    }

    public void write(PersistentEntity entity) {
        safely(() -> {
            var type = getRdfType(entity.getClass());
            var existing = entity.getIri() != null;
            var entityNode = createURI(existing ? entity.getIri().toString() : getWorkspaceURI() + randomUUID());
            var update = new UpdateRequest();

            setProperty(update, existing, entityNode, RDF.type.asNode(), type);

            for (var field : entity.getClass().getDeclaredFields()) {
                if (field.isAnnotationPresent(RDFProperty.class)) {
                    var propertyNode = createURI(field.getAnnotation(RDFProperty.class).value());
                    field.setAccessible(true);
                    var value = field.get(entity);

                    setProperty(update, existing, entityNode, propertyNode, value);
                }
            }

            rdf.update(update.toString());

            if (!existing) {
                entity.setIri(entityNode);
            }

            return null;
        });
    }

    private void setProperty(UpdateRequest update, boolean existing, Node entityNode, Node propertyNode, Object value) {
        if (existing) {
            update.add(new UpdateDeleteWhere(new QuadAcc(singletonList(new Quad(
                    defaultGraphIRI,
                    entityNode,
                    propertyNode,
                    createVariable("o"))))));
        }
        if (value instanceof Iterable) {
            ((Iterable<?>) value).forEach(item -> addProperty(update, entityNode, propertyNode, item));
        } else if (value != null) {
            addProperty(update, entityNode, propertyNode, value);
        }
    }

    private void addProperty(UpdateRequest update, Node entityNode, Node propertyNode, Object value) {
        update.add(new UpdateDataInsert(new QuadDataAcc(singletonList(new Quad(
                defaultGraphIRI,
                entityNode,
                propertyNode,
                valueToNode(value))))));
    }

    private Node valueToNode(Object value) {
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

    public <T extends PersistentEntity> T read(Class<T> type, Node iri) {
        return construct(type, storedQuery("select_by_mask", defaultGraphIRI, iri))
                .stream().findFirst().orElse(null);
    }

    private <T extends PersistentEntity> T createEntity(Class<T> type, Resource resource) throws InstantiationException, IllegalAccessException, java.lang.reflect.InvocationTargetException, NoSuchMethodException {
        if (resource.hasProperty(DATE_DELETED) || !resource.hasProperty(RDF.type, createResource(getRdfType(type).getURI()))) {
            return null;
        }
        var ctor = type.getDeclaredConstructor();
        ctor.setAccessible(true);
        var entity = ctor.newInstance();
        entity.setIri(resource.asNode());
        for (var field : entity.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(RDFProperty.class)) {
                var property = createProperty(field.getAnnotation(RDFProperty.class).value());

                if (Collection.class.isAssignableFrom(field.getType())) {
                    field.setAccessible(true);
                    var collection = (Collection) field.get(entity);
                    if (collection == null) {
                        throw new PersistenceException("An uninitialized collection field " + field.getName());
                    }

                    var parameterizedType = (ParameterizedType) field.getGenericType();
                    var valueType = getRawType(parameterizedType.getActualTypeArguments()[0]);

                    resource.listProperties(property).forEachRemaining(stmt ->
                            collection.add(nodeToType(stmt.getObject(), valueType)));
                } else {
                    var stmt = resource.getProperty(property);
                    if (stmt != null) {
                        field.setAccessible(true);
                        var value = nodeToType(stmt.getObject(), field.getType());
                        field.set(entity, value);
                    }
                }
            }
        }
        return entity;
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

        throw new PersistenceException("Cannot cast " + object + " to " + type.getSimpleName());
    }

    public <T extends PersistentEntity> List<T> list(Class<T> type) {
        return construct(type, storedQuery("select_by_type", defaultGraphIRI, getRdfType(type)));
    }

    public <T extends PersistentEntity> List<T> construct(Class<T> type, String query) {
        return safely(() -> {
            var model = rdf.queryConstruct(query);
            var entities = new ArrayList<T>();
            Iterable<Resource> subjects = model::listSubjects;
            for (var resource : subjects) {
                entities.add(createEntity(type, resource));
            }

            return entities;
        });
    }

    public void delete(PersistentEntity entity) {
        delete(entity.getIri());
    }

    public void delete(Node iri) {
        rdf.update(storedQuery("delete_by_mask", defaultGraphIRI, iri));
    }

    // TODO: soft deletion

    private static Node getRdfType(Class<? extends PersistentEntity> type) {
        return ofNullable(type.getAnnotation(RDFType.class))
                .map(annotation -> createURI(annotation.value()))
                .orElseThrow(() -> new PersistenceException("No RDF type for " + type));
    }

    private static <T> T safely(Callable<T> action) {
        try {
            return action.call();
        } catch (PersistenceException e) {
            throw e;
        } catch (Exception e) {
            throw new PersistenceException(e);
        }
    }
}
