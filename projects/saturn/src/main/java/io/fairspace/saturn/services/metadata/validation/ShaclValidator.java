package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Graph;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.impl.ResourceImpl;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.engine.ValidationContext;
import org.apache.jena.shacl.parser.Shape;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.sparql.path.P_Link;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.shacl.lib.G.hasType;
import static org.apache.jena.shacl.lib.G.isOfType;
import static org.apache.jena.shacl.validation.ValidationProc.execValidateShape;

public class ShaclValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affected = removed.listSubjects()
                .filterKeep(after::containsResource)
                .andThen(added.listSubjects())
                .mapWith(FrontsNode::asNode)
                .toSet();

        if (affected.isEmpty()) {
            return;
        }

        var data = after.getGraph();
        var vCxt = new ValidationContext(Shapes.parse(vocabulary.getGraph()), data);

        affected.forEach(node ->
                vCxt.getShapes().forEach(shape -> {
                    if (isTarget(shape, data, node)) {
                        execValidateShape(vCxt, after.getGraph(), shape, node);
                    }
                }));

        vCxt.generateReport()
                .getEntries()
                .forEach(entry -> {
                    if (entry.severity().level() == SHACL.Violation) {
                        var subject = new ResourceImpl(entry.focusNode(), null);
                        var predicate = (entry.resultPath() instanceof P_Link)
                                ? createProperty(((P_Link) entry.resultPath()).getNode().getURI())
                                : null;
                        var object = entry.value() != null
                                ? before.asRDFNode(entry.value())
                                : null;
                        violationHandler.onViolation(entry.message(), subject, predicate, object);
                    }
                });
    }

    private static boolean isTarget(Shape shape, Graph data, Node node) {
        return shape.getTargets()
                .stream()
                .anyMatch(target -> {
                    var targetObject = target.getObject();
                    switch (target.getTargetType()) {
                        case targetClass:
                            return hasType(data, node, targetObject);
                        case targetNode:
                            return targetObject.equals(node);
                        case targetObjectsOf:
                            return data.contains(null, targetObject, node);
                        case targetSubjectsOf:
                            return data.contains(node, targetObject, null);
                        case implicitClass:
                            return isOfType(data, node, targetObject);
                        default:
                            return false;
                    }
                });
    }
}
