package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;

public class MachineOnlyClassesValidator implements MetadataRequestValidator {
    private final List<Resource> machineOnlyClasses;

    public MachineOnlyClassesValidator(Model vocabulary) {
        this.machineOnlyClasses = vocabulary
        .listSubjectsWithProperty(SH.targetClass)
        .filterKeep(shape -> shape.hasLiteral(FS.machineOnly, true))
        .mapWith(shape -> shape.getPropertyResourceValue(SH.targetClass))
        .toList() ;
    }

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        machineOnlyClasses.forEach(moc -> {
            added.listStatements(null, RDF.type, moc)
                    .forEachRemaining(statement -> violationHandler.onViolation("Trying to create a machine-only entity", statement));
            removed.listStatements(null, RDF.type, moc)
                    .forEachRemaining(statement -> violationHandler.onViolation("Trying to change type of a machine-only entity", statement));
        });
    }

}
