package io.fairspace.saturn.services.metadata.validation;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.Triple;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.vocabulary.SHACL;
import org.apache.jena.sparql.path.P_Link;
import org.apache.jena.sparql.path.Path;

import java.util.Set;

import static org.apache.jena.shacl.validation.ValidationProc.simpleValidationNode;

public class ShaclValidator implements MetadataRequestValidator {
    private volatile Pair<Set<Triple>, Shapes> parsedShapes;

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

        var shapes = getShapes(vocabulary);
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

    private Shapes getShapes(Model vocabulary) {
        Shapes shapes;
        var parsed = parsedShapes;
        var triples = vocabulary.listStatements().mapWith(Statement::asTriple).toSet();
        if (parsed == null || !parsed.getKey().equals(triples)) {
            shapes = Shapes.parse(vocabulary.getGraph());
            parsedShapes = Pair.of(triples, shapes);
        } else {
            shapes = parsed.getValue();
        }
        return shapes;
    }

    private static Node pathToNode(Path path) {
        return (path instanceof P_Link) ? ((P_Link) path).getNode() : null;
    }
}
