package io.fairspace.saturn.rdf;

import org.apache.jena.enhanced.EnhGraph;
import org.apache.jena.graph.compose.Difference;
import org.apache.jena.graph.compose.Union;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdf.model.impl.ModelCom;
import org.apache.jena.rdf.model.impl.PropertyImpl;
import org.apache.jena.sparql.graph.GraphZero;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.*;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class ModelUtils {
    /**
     * An immutable empty model
     */
    public static final Model EMPTY_MODEL = new ModelCom(GraphZero.instance());

    /**
     *
     * @param statements
     * @return A mutable model initialized with statements
     */
    public static Model modelOf(Statement... statements) {
        return createDefaultModel().add(statements);
    }

    /**
     * @param nodes
     * @return A mutable model consisting of statements produced by splitting nodes into triples
     */
    public static Model modelOf(RDFNode... nodes) {
        if (nodes.length % 3 != 0) {
            throw new IllegalArgumentException("nodes");
        }
        var m = createDefaultModel();
        for (var i = 0; i < nodes.length / 3; i++) {
            m.add(nodes[3 * i].asResource(), (Property) nodes[3 * i + 1], nodes[3 * i + 2]);
        }
        return m;
    }

    public static Model differenceView(Model left, Model right) {
        return right.isEmpty() ? left : new ModelCom(new Difference(left.getGraph(), right.getGraph()));
    }

    public static Model unionView(Model left, Model right) {
        return right.isEmpty() ? left : new ModelCom(new Union(left.getGraph(), right.getGraph()));
    }

    public static Model updatedView(Model base, Model removed, Model added) {
        return unionView(differenceView(base, removed), added);
    }

    private static void addTransitiveObjects(Set<Resource> reached, Resource subject, Property predicate) {
        reached.add(subject);
        StmtIterator it = subject.listProperties(predicate);
        try {
            while (it.hasNext()) {
                RDFNode object = it.next().getObject();
                if (object instanceof Resource) {
                    if (!reached.contains(object)) {
                        addTransitiveObjects(reached, (Resource)object, predicate);
                    }
                }
            }
        }
        finally {
            it.close();
        }
    }

    private static void addTransitiveSubjects(Set<Resource> reached, Resource object, Property predicate) {
        if (object != null) {
            reached.add(object);
            StmtIterator it = object.getModel().listStatements(null, predicate, object);
            try {
                while (it.hasNext()) {
                    Resource subject = it.next().getSubject();
                    if (!reached.contains(subject)) {
                        addTransitiveSubjects(reached, subject, predicate);
                    }
                }
            }
            finally {
                it.close();
            }
        }
    }

    public static Set<Resource> getAllTransitiveSubjects(Resource object, Property predicate) {
        Set<Resource> set = new HashSet<Resource>();

        addTransitiveSubjects(set, object, predicate);

        set.remove(object);
        return set;
    }

    public static Property asProperty(Resource resource) {
        return (resource instanceof Property)
                ? (Property) resource
                : new PropertyImpl(resource.asNode(), (EnhGraph)resource.getModel());

    }

    public static Set<Resource> getAllInstances(Resource cls) {
            Model model = cls.getModel();
            Set<Resource> classes = getAllSubClasses(cls);
            classes.add(cls);
            Set<Resource> results = new HashSet<Resource>();
            for(Resource subClass : classes) {
                StmtIterator it = model.listStatements(null, RDF.type, subClass);
                while (it.hasNext()) {
                    results.add(it.next().getSubject());
                }
            }
            return results;
    }

    public static Set<Resource> getAllSubClasses(Resource cls) {
        return getAllTransitiveSubjects(cls, RDFS.subClassOf);
    }

    public static Set<Resource> getAllSubClassesStar(Resource cls) {
        Set<Resource> results = getAllTransitiveSubjects(cls, RDFS.subClassOf);
        results.add(cls);
        return results;
    }

    public static Set<Resource> getAllSubProperties(Property superProperty) {
        return getAllTransitiveSubjects(superProperty, RDFS.subPropertyOf);
    }

    public static Set<Resource> getAllSuperClasses(Resource cls) {
        return getAllTransitiveObjects(cls, RDFS.subClassOf);
    }

    public static Set<Resource> getAllSuperClassesStar(Resource cls) {
        var results = getAllTransitiveObjects(cls, RDFS.subClassOf);
        results.add(cls);
        return results;
    }

    public static Set<Resource> getAllSuperProperties(Property subProperty) {
        return getAllTransitiveObjects(subProperty, RDFS.subPropertyOf);
    }

    public static Set<Resource> getAllTransitiveObjects(Resource subject, Property predicate) {
        var set = new HashSet<Resource>();
        addTransitiveObjects(set, subject, predicate);
        set.remove(subject);
        return set;
    }

    public static Set<Resource> getAllTypes(Resource instance) {
        Set<Resource> types = new HashSet<Resource>();
        StmtIterator it = instance.listProperties(RDF.type);
        try {
            while (it.hasNext()) {
                Resource type = it.next().getResource();
                types.add(type);
                types.addAll(getAllSuperClasses(type));
            }
        }
        finally {
            it.close();
        }
        return types;
    }

    public static Integer getIntegerProperty(Resource subject, Property predicate) {
        var s = subject.getProperty(predicate);
        return (s != null && s.getObject().isLiteral()) ? s.getInt() : null;

    }

    public static RDFList getListProperty(Resource subject, Property predicate) {
        Statement s = subject.getProperty(predicate);
        if(s != null && s.getObject().canAs(RDFList.class)) {
            return s.getResource().as(RDFList.class);
        }
        else {
            return null;
        }
    }

    public static List<Literal> getLiteralProperties(Resource subject, Property predicate) {
        List<Literal> results = new ArrayList<Literal>();
        StmtIterator it = subject.listProperties(predicate);
        while(it.hasNext()) {
            Statement s = it.next();
            if(s.getObject().isLiteral()) {
                results.add(s.getLiteral());
            }
        }
        return results;
    }

    public static RDFNode getProperty(Resource subject, Property predicate) {
        var s = subject.getProperty(predicate);
        return (s != null) ? s.getObject() : null;
    }

    public static List<Resource> getReferences(Property predicate, Resource object) {
        List<Resource> results = new ArrayList<Resource>();
        StmtIterator it = object.getModel().listStatements(null, predicate, object);
        while(it.hasNext()) {
            Statement s = it.next();
            results.add(s.getSubject());
        }
        return results;
    }

    public static Resource getResourcePropertyWithType(Resource subject, Property predicate, Resource type) {
        StmtIterator it = subject.listProperties(predicate);
        while(it.hasNext()) {
            Statement s = it.next();
            if(s.getObject().isResource() && hasIndirectType(s.getResource(), type)) {
                it.close();
                return s.getResource();
            }
        }
        return null;
    }

    public static List<Resource> getResourceProperties(Resource subject, Property predicate) {
        return subject.listProperties(predicate)
                .filterKeep(stmt -> stmt.getObject().isResource())
                .mapWith(Statement::getResource)
                .toList();
    }

    public static String getStringProperty(Resource subject, Property predicate) {
        Statement s = subject.getProperty(predicate);
        if(s != null && s.getObject().isLiteral()) {
            return s.getString();
        }
        else {
            return null;
        }
    }

    public static boolean getBooleanProperty(Resource subject, Property predicate) {
        return subject.hasLiteral(predicate, true);
    }

    public static Collection<Resource> getSuperClasses(Resource subClass) {
        NodeIterator it = subClass.getModel().listObjectsOfProperty(subClass, RDFS.subClassOf);
        Set<Resource> results = new HashSet<>();
        while (it.hasNext()) {
            RDFNode node = it.nextNode();
            if (node instanceof Resource) {
                results.add((Resource)node);
            }
        }
        return results;
    }

    public static Resource getType(Resource instance) {
        return instance.getPropertyResourceValue(RDF.type);
    }

    public static List<Resource> getTypes(Resource instance) {
        return getResourceProperties(instance, RDF.type);
    }

    public static boolean hasIndirectType(Resource instance, Resource expectedType) {

        if(expectedType.getModel() == null) {
            expectedType = expectedType.inModel(instance.getModel());
        }

        StmtIterator it = instance.listProperties(RDF.type);
        while(it.hasNext()) {
            Statement s = it.next();
            if(s.getObject().isResource()) {
                Resource actualType = s.getResource();
                if(actualType.equals(expectedType) || hasSuperClass(actualType, expectedType)) {
                    it.close();
                    return true;
                }
            }
        }
        return false;
    }

    public static boolean hasSuperClass(Resource subClass, Resource superClass) {
        return hasSuperClass(subClass, superClass, new HashSet<>());
    }

    private static boolean hasSuperClass(Resource subClass, Resource superClass, Set<Resource> reached) {
        var it = subClass.listProperties(RDFS.subClassOf)
                .mapWith(Statement::getObject)
                .mapWith(RDFNode::asResource)
                .filterKeep(t -> superClass.equals(t) || reached.add(t) && hasSuperClass(t, superClass, reached));

        try {
            return it.hasNext();
        } finally {
            it.close();
        }

    }
}
