package io.fairspace.ceres.web

import mu.KotlinLogging.logger
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.HttpMediaTypeNotAcceptableException
import org.springframework.web.HttpMediaTypeNotSupportedException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import java.net.URISyntaxException

@ControllerAdvice
@ResponseBody
class CeresExceptionHandler {
    val log = logger {  }

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

    @ExceptionHandler(URISyntaxException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    protected fun handleURISyntaxException(ex: URISyntaxException): ErrorBody {
        return ErrorBody("The request contains an invalid URI: " + ex.input)
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    protected fun handleGenericException(ex: Exception): ErrorBody {
        val errorBody = ErrorBody("An internal error occurred.")
        log.error("An unexpected error occurred.", ex)
        return errorBody
    }


}
