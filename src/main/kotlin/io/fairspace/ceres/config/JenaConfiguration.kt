package io.fairspace.ceres.config

import io.fairspace.ceres.repository.ModelRepository
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.reasoner.ReasonerRegistry
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
    fun dataset() = TDB2Factory.connectDataset(datasetPath)

    @Bean
    fun reasoner(): Reasoner {
        val inferenceModel = FileManager.get().loadModel("inference-model.jsonld")
        return ReasonerRegistry.getOWLReasoner().bindSchema(inferenceModel)
    }

    @Bean
    fun modelRepository() = ModelRepository(dataset(), reasoner())
}