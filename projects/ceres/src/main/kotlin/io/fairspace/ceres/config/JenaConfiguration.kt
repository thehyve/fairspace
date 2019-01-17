package io.fairspace.ceres.config

import io.fairspace.ceres.metadata.repository.OwlPropertyInverter
import org.apache.jena.rdf.model.Model
import org.apache.jena.tdb2.TDB2Factory.connectDataset
import org.apache.jena.util.FileManager
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JenaConfiguration {
    @Value("\${jena.dataset.path}")
    lateinit var datasetPath: String

    @Bean
    fun dataset() = connectDataset(datasetPath)

    @Bean
    fun inferenceModel() = FileManager.get().loadModel("inference-model.jsonld")

    @Bean
    fun modelTransformer(): (Model) -> Model = {
        it.register(OwlPropertyInverter(it, inferenceModel()))
    }
}
