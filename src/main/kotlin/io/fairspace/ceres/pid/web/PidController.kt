package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.exception.InvalidParameterException
import io.fairspace.ceres.pid.model.PidDTO
import io.fairspace.ceres.pid.service.PidService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/pid")
class PidController(val pidService: PidService) {
    @GetMapping(produces = ["application/json"])
    fun get(@RequestParam("id", required = false) id: String?,
            @RequestParam("value", required = false) value: String?): PidDTO {
        if (id != null && value == null) {
            return pidService.findById(id)
        } else if (value != null && id == null) {
            return pidService.findByValue(value)
        } else {
            throw InvalidParameterException("GET operation for pid endpoint should have either id or value parameter.")
        }
    }

    @PostMapping(produces = ["application/json"])
    fun post(@RequestBody pid: PidDTO): PidDTO =
        pidService.findOrCreateByValue(pid.value)


    @DeleteMapping
    fun delete(@RequestParam("id") id: String?,
               @RequestParam("value") value: String?
    ) {
        if (id != null && value == null) {
            pidService.deleteById(id)
        } else if (value != null && id == null) {
            pidService.deleteByValue(value)
        } else {
            throw InvalidParameterException("DELETE operation for pid endpoint should have either id or value parameter.")
        }
    }
}
