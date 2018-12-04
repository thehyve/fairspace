package io.fairspace.ceres.config

import io.fairspace.ceres.metadata.repository.OwlPropertyInverter
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
    fun enhancer() = OwlPropertyInverter(FileManager.get().loadModel("inference-model.jsonld"))
}
