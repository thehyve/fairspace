package io.fairspace.saturn.services.metadata.validation;

import lombok.Value;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

@Value
public class Violation {
    private String message;
    private Resource subject;
    private Property predicate;
    private RDFNode value;
}
