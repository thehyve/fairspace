package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.vocabulary.*;
import org.apache.jena.graph.Node;
import org.apache.jena.query.text.EntityDefinition;
import org.apache.jena.vocabulary.RDFS;

import java.util.*;

/**
 * An entity definition with reasonable defaults
 */
public class AutoEntityDefinition extends EntityDefinition {
    private static final Set<String> sensitiveProperties = Set.of(
            FS.WORKSPACE_DESCRIPTION_URI
    );

    public AutoEntityDefinition() {
        super("iri", "label", null, RDFS.label.asNode());
    }

    @Override
    public String getField(Node predicate) {
        var stored = super.getField(predicate);
        if (stored != null) {
            return stored;
        }

        var uri = predicate.getURI();

        if (sensitiveProperties.contains(uri)) {
            return null;
        }

        var separatorPos = uri.lastIndexOf('#');
        if (separatorPos < 0) {
            separatorPos = uri.lastIndexOf('/');
        }

        if (separatorPos >= 0) {
            var filed = uri.substring(separatorPos + 1);
            set(filed, predicate);
            return filed;
        }

        return null;
    }
}
