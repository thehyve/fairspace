package io.fairspace.saturn.services.metadata.serialization;

import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.NotImplementedException;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.HashSet;

import static org.topbraid.spin.util.JenaUtil.*;

/**
 * This serializer will render a DOT graph file for the SHACL classes
 * and properties in the given model. If no classes could be found, an
 * empty graph is returned.
 */
@Slf4j
public class GraphVizSerializer implements Serializer {
    // Mimetype as registered with IANA. See https://www.iana.org/assignments/media-types/text/vnd.graphviz
    public static final String GRAPHVIZ_MIMETYPE = "text/vnd.graphviz";
    private static final String NODE_TEMPLATE = "\"%s\" [label=\"%s\" tooltip=\"%s\"]";
    private static final String EDGE_TEMPLATE = "\"%s\" -> \"%s\" [label=\"%s\"]";

    @Override
    public String getMimeType() {
        return GRAPHVIZ_MIMETYPE;
    }

    @Override
    public String serialize(Model model) {
        var stringBuilder = new StringBuilder("digraph {\n");

        var addedRelationShapes = new HashSet<>();
        model.listSubjectsWithProperty(RDF.type, FS.ClassShape).forEachRemaining(classShape-> {
            var classLabel = getStringProperty(classShape, SH.name);
            var targetClassResource = getResourceProperty(classShape, SH.targetClass);

            // If label or targetclass are missing, don't add the node
            if(classLabel == null || targetClassResource == null) {
                return;
            }

            var targetClass = targetClassResource.getURI();
            addNode(stringBuilder, classLabel, targetClass);

            // Add relation properties as edges
            getResourceProperties(classShape, SH.property).forEach(propertyShape -> {
                // Skip everything but relationshapes
                var type = getType(propertyShape);
                if(type == null || !type.equals(FS.RelationShape))
                    return;

                var propertyLabel = getStringProperty(propertyShape, SH.name);
                var otherClassResource = getResourceProperty(propertyShape, SH.class_);

                // If label or class are missing, don't add the node
                if(classLabel == null || otherClassResource == null) {
                    return;
                }
                var otherClass = otherClassResource.getURI();

                addEdge(stringBuilder, targetClass, otherClass, propertyLabel);

                addedRelationShapes.add(propertyShape);
            });
        });

        stringBuilder.append("\n}");
        return stringBuilder.toString();
    }

    private void addNode(StringBuilder stringBuilder, String classLabel, String targetClass) {
        stringBuilder
                .append("\t")
                .append(String.format(NODE_TEMPLATE, targetClass, classLabel, targetClass))
                .append("\n");
    }

    private void addEdge(StringBuilder stringBuilder, String start, String end, String propertyLabel) {
        stringBuilder
                .append("\t")
                .append(String.format(EDGE_TEMPLATE, start, end, propertyLabel))
                .append("\n");
    }

    @Override
    public Model deserialize(String input, String baseURI) {
        throw new NotImplementedException();
    }
}
