package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;

import static io.fairspace.saturn.rdf.ModelUtils.getBooleanProperty;

public class MachineOnlyClassesValidator implements MetadataRequestValidator {
    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        vocabulary.listSubjectsWithProperty(SHACLM.targetClass)
                .filterKeep(shape -> getBooleanProperty(shape, FS.machineOnly))
                .mapWith(shape -> shape.getPropertyResourceValue(SHACLM.targetClass))
                .forEachRemaining(moc -> {
                    added.listStatements(null, RDF.type, moc)
                            .forEachRemaining(statement -> violationHandler.onViolation("Trying to create a machine-only entity", statement));
                    removed.listStatements(null, RDF.type, moc)
                            .forEachRemaining(statement -> violationHandler.onViolation("Trying to change type of a machine-only entity", statement));
                });
    }

}
