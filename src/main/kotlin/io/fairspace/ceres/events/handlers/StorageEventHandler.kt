package io.fairspace.ceres.events.handlers

import io.fairspace.ceres.events.model.Collection
import io.fairspace.ceres.events.model.PathType
import io.fairspace.ceres.events.model.StorageEvent
import io.fairspace.ceres.metadata.repository.ModelRepository
import io.fairspace.ceres.metadata.service.MetadataService
import io.fairspace.ceres.metadata.vocabulary.Fairspace
import io.fairspace.ceres.pid.service.PidService
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.Resource
import org.apache.jena.rdf.model.impl.StatementImpl
import org.apache.jena.vocabulary.RDF
import org.slf4j.LoggerFactory
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.io.File

@Component
@ConditionalOnProperty("app.rabbitmq.enabled")
class StorageEventHandler(val pidService: PidService, val modelRepository: ModelRepository, val metadataService: MetadataService) {
    val log = LoggerFactory.getLogger(StorageEventHandler::class.java)

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.create}"])
    fun receiveCreateMessage(message: StorageEvent) {
        // Filter the creation of unknown paths
        if(message.type == PathType.UNKNOWN) {
            log.debug("Message received for creating an unknown type of storage: {}", message.path)
            return
        }

        // Filter the creation of root (collection) directories
        if(message.path.split("/").size < 3) {
            log.debug("Message received for creating a top-level directory or file {} (most probably a new collection). This message will not be processed", message.path)
            return
        }

        log.debug("Create message received from RabbitMQ: {}", message)

        // Generate identifiers
        storeParentRelation(message.path, message.type, message.collection)
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.move}"])
    fun receiveMoveMessage(message: StorageEvent) {
        log.debug("Move message received from RabbitMQ: {}", message)
        val source = message.path
        val destination = message.destination!!

        // Update all identifiers within the old path (could be multiple
        // if the path is a directory
        pidService.updateByPrefix(source, destination)

        // Afterwards, ensure that the tree structure is properly
        // updated in the metadata as well. This is only needed if the file/directory
        // is moved to another parent directory
        if(File(source).parent != File(destination).parent) {
            storeParentRelation(destination, message.type, message.collection)
        }
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.copy}"])
    fun receiveCopyMessage(message: StorageEvent) {
        log.debug("Copy message received from RabbitMQ: {}", message)

        val source = message.path
        val destination = message.destination!!

        // Retrieve all mappings for the oldPath
        val sourceIdentifiers = pidService.findByPrefix(source)

        // We get a mapping for every descendant of the source
        // We need a uri for each one of them in the destination as well
        val mapping = mutableMapOf<String, String>()
        sourceIdentifiers.forEach {
            val pathInDestination = it.value.replace(source, destination)
            val newIdentifier = pidService.findOrCreateByValue(pathInDestination)
            mapping[it.id] = newIdentifier.id
        }

        // Now, retrieve the metadata for the original URIs and replace the original URIs
        // with the new ones
        val originalMetadata = metadataService.getMetadataForResources(mapping.keys)
        val metadataForNewEntities = replaceEntities(originalMetadata, mapping)

        // Store the new model
        modelRepository.add(metadataForNewEntities)

        // Afterwards, ensure that the tree structure is properly
        // updated in the metadata as well. This is only needed if the file/directory
        // is copied to another parent directory
        if(File(source).parent != File(destination).parent) {
            storeParentRelation(destination, message.type, message.collection)
        }
    }

    @RabbitListener(queues = ["\${app.rabbitmq.topology.storage.queues.delete}"])
    fun receiveDeleteMessage(message: StorageEvent) {
        log.debug("Delete message received from RabbitMQ: {}", message)

        // Delete the mappings for this path (and underlying paths)
        pidService.deleteByPrefix(message.path)
    }

    /**
     * Stores the relation between the path and its parent in metadata
     */
    private fun storeParentRelation(path: String, type: PathType, collection: Collection?) {
        val currentIdentifier = pidService.findOrCreateByValue(path)
        val parentUri = getParentUri(path, collection)
        val metadataType = if(type == PathType.FILE) Fairspace.file else Fairspace.directory

        if(parentUri == null) {
            log.warn("No parent uri found for path {}. Not storing parent relation", path)
            return
        }

        storePartOfRelation(parentUri, currentIdentifier.id, metadataType)
    }


    /**
     * Stores a partOf relation between the currentUri and the parentUri
     */
    private fun storePartOfRelation(parentUri: String, currentUri: String, type: String) {
        val model = ModelFactory.createDefaultModel().apply {
            createResource(currentUri)
                    .addProperty(RDF.type, createResource(type))
                    .addProperty(createProperty(Fairspace.partOf), createResource(parentUri))
        }

        // If any relation already exists, replace it
        modelRepository.update(model)
    }

    /**
     * Returns the metadata URI for the parent of the given path. Can be either the parent directory or the collection
     * @param path Current path. Includes a leading / and the collection location
     * @param collection
     */
    private fun getParentUri(path: String, collection: Collection?): String? {
        val pathParts = path.split("/")

        // First part is empty (because of the leading /)
        // Second part is the collection location
        return if(pathParts.size == 3) {
            collection?.uri
        } else {
            pidService.findOrCreateByValue(File(path).parent).id
        }
    }

    /**
     * Creates a model where subjects and objects are replaced by another uri
     */
    private fun replaceEntities(model: Model, mapping: Map<String, String>): Model {
        val newModel = ModelFactory.createDefaultModel()

        model.listStatements().forEach {
            // Determine the statement  with replaced entities
            val newSubject = model.createResource(mapping.getOrDefault(it.subject.uri, it.subject.uri))
            val newObject = if(it.`object`.isResource()) {
                val objectResource = it.`object`.asResource()
                model.createResource(mapping.getOrDefault(objectResource.uri, objectResource.uri))
            } else {
                it.`object`
            }

            newModel.add(StatementImpl(newSubject, it.predicate, newObject))
        }

        return newModel
    }

}
