package io.fairspace.saturn.config;

import io.milton.resource.Resource;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.util.Symbol;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.DeletionValidator;
import io.fairspace.saturn.services.metadata.validation.MachineOnlyClassesValidator;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.services.metadata.validation.ShaclValidator;
import io.fairspace.saturn.services.metadata.validation.URIPrefixValidator;
import io.fairspace.saturn.services.metadata.validation.UniqueLabelValidator;
import io.fairspace.saturn.webdav.DavFactory;

@Configuration
public class MetadataConfig {

    public static final Symbol METADATA_SERVICE = Symbol.create("metadata_service");

    @Bean
    public MetadataService metadataService(
            Transactions transactions,
            @Qualifier("davFactory") DavFactory davFactory,
            MetadataPermissions metadataPermissions,
            @Qualifier("dataset") Dataset dataset,
            @Qualifier("vocabulary") Model vocabulary,
            @Qualifier("systemVocabulary") Model systemVocabulary) {
        // TODO: validators to be managed by Spring
        var metadataValidator = new ComposedValidator(
                new MachineOnlyClassesValidator(vocabulary),
                new ProtectMachineOnlyPredicatesValidator(vocabulary),
                new URIPrefixValidator(((Resource) davFactory.root).getUniqueId()),
                new DeletionValidator(),
                new UniqueLabelValidator(),
                new ShaclValidator(vocabulary));
        var metadataService =
                new MetadataService(transactions, vocabulary, systemVocabulary, metadataValidator, metadataPermissions);
        dataset.getContext().set(METADATA_SERVICE, metadataService);
        return metadataService;
    }
}
