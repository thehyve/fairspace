package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.impl.ResourceImpl;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.engine.TargetType;
import org.apache.jena.shacl.engine.ValidationContext;
import org.apache.jena.shacl.parser.Shape;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.vocabulary.RDF;

import static org.apache.jena.shacl.validation.ValidationProc.execValidateShape;

public class ShaclValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affected = removed.listSubjects()
                .filterKeep(after::containsResource)
                .andThen(added.listSubjects())
                .toSet();

        if (affected.isEmpty()) {
            return;
        }

        var vCxt = new ValidationContext(Shapes.parse(vocabulary.getGraph()), after.getGraph());

        affected.forEach(resource -> {
            var typeResource = resource.getPropertyResourceValue(RDF.type);
            if (typeResource != null) {
                var type = typeResource.asNode();
                vCxt.getShapes().forEach(shape -> {
                    if (isTarget(shape, type)) {
                        execValidateShape(vCxt, after.getGraph(), shape, resource.asNode());
                    }
                });
            }
        });

        vCxt.generateReport()
                .getEntries()
                .forEach(entry -> {
                    if (entry.severity().level() == SHACL.Violation) {
                        violationHandler.onViolation(entry.message(), new ResourceImpl(entry.focusNode(), null), null, null);
                    }
                });
    }

    private static boolean isTarget(Shape shape, Node type) {
        // TODO: Support other target types
        return shape.getTargets()
                .stream()
                .filter(t -> t.getTargetType() == TargetType.targetClass)
                .anyMatch(t -> type.equals(t.getObject()));
    }
}
