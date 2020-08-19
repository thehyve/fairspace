package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.List;
import java.util.Optional;

import static java.util.Optional.ofNullable;

public class ShapeUtils {
    public static Optional<Resource> getClassShapeForResource(Resource resource, Model vocabulary) {
        return ofNullable(resource.getPropertyResourceValue(RDF.type))
                .flatMap(type -> getClassShapeForClass(type, vocabulary));
    }

    public static Optional<Resource> getClassShapeForClass(Resource type, Model vocabulary) {
        return vocabulary.listSubjectsWithProperty(SHACLM.targetClass, type)
                .nextOptional()
                .or(() -> Optional.of(type.inModel(vocabulary))
                        .filter(shape -> shape.hasProperty(RDF.type, SHACLM.NodeShape) && shape.hasProperty(RDF.type, RDFS.Class)));
    }

    public static List<Resource> getPropertyShapesForResource(Resource resource, Model vocabulary) {
        return getClassShapeForResource(resource, vocabulary)
                .map(classShape -> classShape.listProperties(SHACLM.property)
                        .mapWith(stmt -> stmt.getObject().asResource())
                        .toList())
                .orElse(List.of());
    }
}
