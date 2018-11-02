package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.service.PidService
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/pid")
class PidController(val pidService: PidService) {


    @GetMapping( produces = [ "application/json"], params = ["id"])
    fun get (@RequestParam("id", required = false ) id: UUID) {
        pidService.findById(id)
    }

    @GetMapping( produces = [ "application/json"], params = ["value"])
    fun get (@RequestParam("value", required = false ) value: String ) {
        pidService.findByValue(value)
    }

    @PostMapping( produces = [ "application/json"] )
    fun post (@RequestBody pid : Pid) {
        pidService.add(pid, errorAlreadyExists = true )
    }

    @PatchMapping ( produces = [ "application/json"])
    fun patch ( @RequestBody pid : Pid ) {
        pidService.add(pid, errorAlreadyExists = false )
    }

    @DeleteMapping ( params = ["id"])
    fun delete ( @RequestParam ("id") id: UUID ) {
        pidService.delete(id)
    }

    @DeleteMapping ( params = ["value"])
    fun delete ( @RequestParam ("value") value: String ) {
        pidService.delete(value)
    }

}
