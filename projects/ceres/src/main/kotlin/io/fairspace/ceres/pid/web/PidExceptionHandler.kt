package io.fairspace.ceres.pid.web

import io.fairspace.ceres.pid.exception.InvalidParameterException
import io.fairspace.ceres.web.ErrorBody
import io.fairspace.ceres.pid.exception.InvalidPersistentIdentifierException
import io.fairspace.ceres.pid.exception.MappingNotFoundException
import io.fairspace.ceres.pid.exception.ValueAlreadyExistsException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus

@ControllerAdvice
@ResponseBody
class PidExceptionHandler {
    @ExceptionHandler(MappingNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    protected fun handleMappingNotFoundException(ex: MappingNotFoundException): ErrorBody {
        return ErrorBody("Requested mapping could not be found")
    }

    @ExceptionHandler(ValueAlreadyExistsException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    protected fun handleMappingAlreadyExistsException(ex: ValueAlreadyExistsException): ErrorBody {
        return ErrorBody("Mapping already exists: ${ex}")
    }

    @ExceptionHandler(InvalidPersistentIdentifierException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected fun invalidPersistentIdentifierException(ex: InvalidPersistentIdentifierException): ErrorBody {
        return ErrorBody("Invalid persistent identifier: ${ex}")
    }

    @ExceptionHandler(InvalidParameterException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected fun invalidParameterException(ex: InvalidParameterException): ErrorBody {
        return ErrorBody("Invalid parameters specified")
    }

}
