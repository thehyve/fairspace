package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.util.Symbol;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetadataConfig {

    public static final Symbol METADATA_SERVICE = Symbol.create("metadata_service");

    @Bean
    public MetadataService metadataService(
            Transactions transactions,
            MetadataPermissions metadataPermissions,
            @Qualifier("dataset") Dataset dataset,
            @Qualifier("vocabulary") Model vocabulary,
            @Qualifier("systemVocabulary") Model systemVocabulary,
            @Qualifier("composedValidator") ComposedValidator composedValidator) {
        var metadataService =
                new MetadataService(transactions, vocabulary, systemVocabulary, composedValidator, metadataPermissions);
        dataset.getContext().set(METADATA_SERVICE, metadataService);
        return metadataService;
    }
}
