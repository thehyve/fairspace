package io.fairspace.ceres.config

import io.fairspace.ceres.metadata.repository.PropertyInverter
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.tdb2.TDB2Factory
import org.apache.jena.util.FileManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JenaConfiguration {
    @Value("\${jena.dataset.path}")
    lateinit var datasetPath: String;

    @Bean
    fun model() = TDB2Factory.connectDataset(datasetPath).defaultModel

    @Bean
    fun propertyInverter() = PropertyInverter(
            FileManager.get().loadModel("inference-model.jsonld").run {
                listStatements(null, createProperty("http://www.w3.org/2002/07/owl#inverseOf"), null as? RDFNode)
                        .asSequence()
                        .map { it.subject.uri to it.`object`.asResource().uri }
            })
}
