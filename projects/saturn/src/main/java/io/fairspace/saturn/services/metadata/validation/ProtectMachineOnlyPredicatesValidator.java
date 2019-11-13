package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.topbraid.shacl.vocabulary.SH;

import java.util.HashMap;
import java.util.Set;

import static io.fairspace.saturn.vocabulary.Inference.getClassShapeForClass;
import static java.util.stream.Collectors.toSet;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.topbraid.spin.util.JenaUtil.getResourceProperties;

/**
 * This validator checks whether the requested action will modify any machine-only
 * predicates. If so, the request will not validate
 */
public class ProtectMachineOnlyPredicatesValidator implements MetadataRequestValidator {

    @Override
    public void validate(Model before, Model after, Model removed, Model added, Model vocabulary, ViolationHandler violationHandler) {
        validateModelAgainstMachineOnlyPredicates(removed, before, vocabulary, violationHandler);
        validateModelAgainstMachineOnlyPredicates(added, after, vocabulary, violationHandler);

    }

    private void validateModelAgainstMachineOnlyPredicates(Model diff, Model target, Model vocabulary, ViolationHandler violationHandler) {
        var machineOnlyPropertiesByType = new HashMap<Resource, Set<Property>>();

        diff.listSubjects()
                .forEachRemaining(resource -> {
                    var type = resource.inModel(target).getPropertyResourceValue(RDF.type);
                    if (type != null) {
                        var props = machineOnlyPropertiesByType.computeIfAbsent(type, t ->
                                getClassShapeForClass(t, vocabulary)
                                        .map(classShape -> getResourceProperties(classShape, SH.property)
                                                .stream()
                                                .filter(p -> p.hasLiteral(FS.machineOnly, true))
                                                .map(p -> createProperty(p.getPropertyResourceValue(SH.path).getURI()))
                                                .collect(toSet())
                                        )
                                        .orElse(Set.of()));

                        resource.listProperties()
                                .filterKeep(stmt -> props.contains(stmt.getPredicate()))
                                .forEachRemaining(stmt -> violationHandler.onViolation("The given model contains a machine-only predicate", stmt));
                    }
                });
    }
}
