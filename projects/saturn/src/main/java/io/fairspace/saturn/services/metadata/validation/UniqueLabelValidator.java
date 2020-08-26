package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.*;

public class UniqueLabelValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        added.listSubjects()
                .filterKeep(subject -> subject.hasProperty(RDFS.label))
                .forEachRemaining(subject -> {
                    var resource = after.getResource(subject.getURI());
                    var type = resource.getProperty(RDF.type).getObject();
                    var label = resource.getProperty(RDFS.label).getString();
                    var conflictingResourceExists = after
                            .listResourcesWithProperty(RDF.type, type)
                            .filterDrop(res -> res.getURI().equals(resource.getURI()))
                            .filterKeep(res -> res.hasProperty(RDFS.label, label))
                            .hasNext();
                    if (conflictingResourceExists) {
                        violationHandler.onViolation("Duplicate label", resource, RDFS.label, null);
                    }
                });
    }
}
