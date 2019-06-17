package io.fairspace.saturn.services.metadata.validation;

import lombok.AllArgsConstructor;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;

import static io.fairspace.saturn.rdf.SparqlUtils.selectDistinct;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;

@AllArgsConstructor
public class MachineOnlyClassesValidator implements MetadataRequestValidator {
    private final RDFConnection rdf;

    @Override
    public void validate(Model modelToRemove, Model modelToAdd, ViolationHandler violationHandler) {
        var machineOnlyClasses = selectDistinct(rdf, storedQuery("machine_only_classes"), row -> row.getResource("class"));

        modelToAdd.listStatements(null, RDF.type, (RDFNode) null)
                .filterKeep(statement -> machineOnlyClasses.contains(statement.getObject()))
                .forEachRemaining(statement -> violationHandler.onViolation("Trying to create a machine-only entity", statement));

        modelToRemove.listStatements(null, RDF.type, (RDFNode) null)
                .filterKeep(statement -> machineOnlyClasses.contains(statement.getObject()))
                .forEachRemaining(statement -> violationHandler.onViolation("Trying to change type of a machine-only entity", statement));
    }

}
