package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.sparql.path.P_Link;
import org.apache.jena.sparql.path.Path;

import static org.apache.jena.shacl.validation.ValidationProc.simpleValidationNode;

public class ShaclValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        var affected = removed.listSubjects()
                .filterKeep(s -> after.contains(s, null))
                .andThen(added.listSubjects())
                .mapWith(FrontsNode::asNode)
                .toSet();

        if (affected.isEmpty()) {
            return;
        }

        var shapes = Shapes.parse(vocabulary.getGraph());
        var data = after.getGraph();

        affected.forEach(node ->
                simpleValidationNode(shapes, data, node, false)
                        .getEntries()
                        .forEach(entry -> {
                            if (entry.severity().level() == SHACL.Violation) {
                                violationHandler.onViolation(entry.message(), entry.focusNode(), pathToNode(entry.resultPath()), entry.value());
                            }
                        }));
    }

    private static Node pathToNode(Path path) {
        return (path instanceof P_Link) ? ((P_Link) path).getNode() : null;
    }
}
