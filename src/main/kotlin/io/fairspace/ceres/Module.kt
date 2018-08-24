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
    if (environment["authentication.jwt.enabled"].toBoolean()) {
        install(Authentication) {
            jwt {
                val issuer ="${environment["authentication.jwt.issuer"]}/auth/realms/${environment["authentication.jwt.realm"]}"
                realm = environment["authentication.jwt.realm"]
                validate { credentials -> JWTPrincipal(credentials.payload) }
                verifier(get(), issuer)
            }
        }
    }
}

private fun Application.installConverters() {
    install(ContentNegotiation) {
        listOf(RDFFormat.JSONLD)
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

        when (featureOrNull(Authentication)) {
            null -> restrictedApi()
            else -> authenticate { restrictedApi() }
        }
    }
}

private fun Route.restrictedApi() {
    val repository: ModelRepository by application.inject()

    route("/statements") {
        post {
            val delta = call.receive<Model>()

            repository.add(delta)
            call.respond(HttpStatusCode.NoContent)
        }
        get {
            call.respond(repository.list(call.parameters["subject"], call.parameters["predicate"]))
        }
        delete {
            repository.remove(call.parameters["subject"], call.parameters["predicate"])
            call.respond(HttpStatusCode.NoContent)
        }
        patch {
            val delta = call.receive<Model>()

            try {
                repository.update(delta)
                call.respond(HttpStatusCode.NoContent)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.NotFound)
            }
        }
    }
    route("/query") {
        get {
            call.respond(repository.query(call.parameters["query"]!!))
        }
        post {
            call.respond(repository.query(call.receive()))
        }
    }
}
