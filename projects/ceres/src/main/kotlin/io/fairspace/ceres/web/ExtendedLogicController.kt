package io.fairspace.ceres.web

import io.fairspace.ceres.metadata.service.MetadataService
import org.apache.jena.rdf.model.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/extended")
class ExtendedLogicController(val metadataService: MetadataService) {

    @GetMapping(produces = ["application/ld+json"], path = ["/statements"])
    fun getStatementsWithLabels(@RequestParam("subject") subject: String?, @RequestParam("predicate") predicate: String?, @RequestParam("object") obj: String?): Model {
        return metadataService.getStatementsWithObjectLabels(subject, predicate, obj)
    }
}
