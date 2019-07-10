package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Objects;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class Inference {
    public static Model applyInference(Model vocabulary, Model model) {
        var inferred = createDefaultModel();

        model.listStatements().forEachRemaining(stmt ->
                vocabulary.listSubjectsWithProperty(SH.path, stmt.getPredicate())
                        .mapWith(shape -> shape.getPropertyResourceValue(FS.inverseRelation))
                        .filterKeep(Objects::nonNull)
                        .mapWith(inverseShape -> inverseShape.getPropertyResourceValue(SH.path))
                        .filterKeep(Objects::nonNull)
                        .mapWith(Resource::getURI)
                        .mapWith(ResourceFactory::createProperty)
                        .forEachRemaining(inverseProperty -> inferred.add(stmt.getObject().asResource(), inverseProperty, stmt.getSubject())));

        return model.add(inferred);
    }
}
