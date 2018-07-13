package io.fairspace.ceres

import io.fairspace.ceres.repository.ModelRepository
import io.ktor.application.*
import io.ktor.auth.Authentication
import io.ktor.auth.authenticate
import io.ktor.auth.jwt.JWTPrincipal
import io.ktor.auth.jwt.jwt
import io.ktor.features.ContentNegotiation
import io.ktor.features.StatusPages
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.riot.RDFFormat
import org.koin.ktor.ext.get
import org.koin.ktor.ext.inject

@Suppress("unused")
fun Application.ceresModule() {
    installConverters()
    installExceptionHandlers()
    installAuthentication()
    configureRouting()
}

private fun Application.installAuthentication() {
    val cfg = environment.config.config("authentication.jwt")
    if (cfg.property("enabled").getString().toBoolean()) {
        install(Authentication) {
            jwt {
                val issuer = cfg.property("issuer").getString()
                val audience = cfg.propertyOrNull("audience")?.getString() ?: "fairspace"
                realm = cfg.propertyOrNull("realm")?.getString() ?: "fairspace"

                validate { credentials ->
                    when {
                        credentials.payload.audience.contains(audience) -> JWTPrincipal(credentials.payload)
                        else -> null
                    }
                }

                verifier(get(), issuer)
            }
        }
    }
}

private fun Application.installConverters() {
    install(ContentNegotiation) {
        listOf(RDFFormat.RDFJSON)
                .map(::ModelConverter)
                .forEach { register(it.contentType, it) }
        register(ContentType.parse("text/boolean"), TextConverter)
        register(ContentType.parse("application/sparql-results+json"), ResultSetJsonConverter)
    }
}

private fun Application.installExceptionHandlers() {
    install(StatusPages) {
        exception<RuntimeException> {
            call.respond(HttpStatusCode.InternalServerError)
        }
    }
}

private fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Hi, I'm Ceres!", ContentType.Text.Plain)
        }

        if (featureOrNull(Authentication) != null) {
            authenticate {
                restrictedApi()
            }
        } else {
            restrictedApi()
        }
    }
}

private fun Route.restrictedApi() {
    val repository: ModelRepository by application.inject()

    route("/model/{model}") {
        var model: String? = null
        intercept(ApplicationCallPipeline.Call) {
            model = call.parameters["model"]
        }
        route("/statements") {
            post {
                val delta = call.receive<Model>()

                repository.add(model!!, delta)
                call.respond(HttpStatusCode.NoContent)
            }
            get {
                val subject = call.request.queryParameters["subject"]
                val predicate = call.request.queryParameters["predicate"]

                val result = repository.list(model!!, subject, predicate)
                call.respond(result)
            }
            delete {
                val subject = call.request.queryParameters["subject"]
                val predicate = call.request.queryParameters["predicate"]

                repository.remove(model!!, subject, predicate)
                call.respond(HttpStatusCode.NoContent)
            }
        }
        route("/query") {
            get {
                call.respond(repository.query(model!!, call.parameters["query"]!!))
            }
            post {
                call.respond(repository.query(model!!, call.receive()))
            }
        }
    }
}
