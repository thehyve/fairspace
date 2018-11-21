package io.fairspace.ceres.metadata.service

import io.fairspace.ceres.metadata.repository.ModelRepository
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.springframework.stereotype.Component

@Component
class MetadataService(val modelRepository: ModelRepository) {
    val QUERY_ALL_METADATA_FOR_RESOURCES = """
        CONSTRUCT {?s ?p ?t}
        WHERE {
            { ?s ?p ?t FILTER(?s in (%s))}
        }
    """

    fun getMetadataForResources(resources: Collection<String>): Model {
        if(resources.isEmpty()) {
            return ModelFactory.createDefaultModel()
        }

        val query= QUERY_ALL_METADATA_FOR_RESOURCES
                .format(resources.map {"<$it>"}.joinToString(","))

        return modelRepository.query(query) as Model
    }
}
