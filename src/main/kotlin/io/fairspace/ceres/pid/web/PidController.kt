package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.model.PidDTO
import io.fairspace.ceres.pid.service.PidService
import org.apache.jena.reasoner.IllegalParameterException
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/pid")
class PidController(val pidService: PidService) {


    @GetMapping( produces = [ "application/json"], params = ["id","value"])
    fun get ( @RequestParam("id", required = false ) id: String?,
              @RequestParam("value", required = false ) value: String? ) : PidDTO
               {
        if ( id != null && value == null ) {
            return pidService.findById(id)
        }
        else if ( value !=null && id == null ) {
            return pidService.findByValue(value)
        }
        else {
            throw IllegalParameterException ("GET operation for pid endpoint should have either id or value parameter.")
        }

    }

    @GetMapping( "prefixed" , produces = [ "application/json"], params = ["prefix"])
    fun getPrefixed (@RequestParam("prefix" ) prefix: String ) {
        pidService.findByPrefix(prefix)
    }

    @PostMapping( produces = [ "application/json"] )
    fun post (@RequestBody pid : PidDTO) {
        pidService.add(pid, errorAlreadyExists = true )
    }

    @PatchMapping ( produces = [ "application/json"])
    fun patch ( @RequestBody pid : PidDTO ) {
        pidService.add(pid, errorAlreadyExists = false )
    }

    @PatchMapping ("prefixed", produces = [ "application/json"])
    fun patchByPrefix (
                @RequestParam("prefix") prefix: String,
                @RequestParam("newprefix") newPrefix: String
                ) {
        pidService.updateByPrefix(prefix,newPrefix)
    }

    @DeleteMapping ( params = ["id","value"])
    fun delete ( @RequestParam ("id") id: String?,
                 @RequestParam ("value") value: String?
    ) {
        if ( id != null && value == null ) {
            pidService.deleteById(id)
        }
        else if ( value !=null && id == null ) {
            pidService.deleteByValue(value)
        }
        else {
            throw IllegalParameterException ("DELETE operation for pid endpoint should have either id or value parameter.")
        }
    }

    @DeleteMapping ( "prefixed", params = ["prefix"])
    fun deletePrefixed ( @RequestParam ("prefix") prefix: String ) {
        pidService.deleteByPrefix(prefix)
    }

}
