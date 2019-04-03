package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.Vocabulary;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

public class AffectedResourcesDetector {
    private final Vocabulary[] vocabularies;

    public AffectedResourcesDetector(Vocabulary... vocabularies) {
        this.vocabularies = vocabularies;
    }

    public Set<Resource> getAffectedResources(Model model) {
        var resources = new HashSet<Resource>();

        if (model != null) {
            model.listStatements().forEachRemaining(stmt -> {
                        resources.add(stmt.getSubject());

                        if (stmt.getObject().isURIResource() &&
                                Stream.of(vocabularies)
                                        .anyMatch(voc -> voc.isInvertiblePredicate(stmt.getPredicate().getURI()))) {
                            resources.add(stmt.getResource());
                        }
                    }
            );
        }

        return resources;
    }
}
