package io.fairspace.ceres.metadata.web

import io.fairspace.ceres.pid.service.MappingNotFoundException
import io.fairspace.ceres.pid.service.ValueAlreadyExistsException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.HttpMediaTypeNotAcceptableException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus

@ControllerAdvice
@ResponseBody
class CeresExceptionHandler {
    val log = LoggerFactory.getLogger(CeresExceptionHandler::class.java);

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

    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected fun handleNotAcceptableException(ex: HttpMessageNotReadableException): ErrorBody {
        return ErrorBody("Http message not readable")
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException::class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    protected fun handleNotAcceptableException(ex: HttpMediaTypeNotAcceptableException): ErrorBody {
        return ErrorBody("Mediatype not acceptable")
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException::class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    protected fun handleNotSupportedException(ex: HttpMediaTypeNotSupportedException): ErrorBody {
        return ErrorBody("Mediatype not supported")
    }

    @ExceptionHandler(MissingServletRequestParameterException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected fun handleMissingParameterException(ex: MissingServletRequestParameterException): ErrorBody {
        return ErrorBody("Missing request parameter " + ex.parameterName)
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected fun handleGenericException(ex: Exception): ErrorBody {
        val errorBody = ErrorBody("An internal error occurred.")
        log.error("An unexpected error occurred.", ex)
        return errorBody
    }


}
