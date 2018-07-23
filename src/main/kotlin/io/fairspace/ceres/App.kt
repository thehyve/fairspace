package io.fairspace.ceres

import com.auth0.jwk.JwkProviderBuilder
import io.fairspace.ceres.repository.ModelRepository
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import org.apache.jena.tdb2.TDB2Factory
import org.koin.dsl.module.applicationContext
import org.koin.standalone.StandAloneContext.startKoin
import java.net.URL


fun main(args: Array<String>) {
    val env = commandLineEnvironment(args)

    startKoin(listOf(applicationContext {
        bean { TDB2Factory.connectDataset(env["jena.dataset.path"]) }
        bean { ModelRepository(get()) }
        bean {
            val url = String.format("%s/auth/realms/%s/protocol/openid-connect/certs",
                    env["authentication.jwt.issuer"],
                    env["authentication.jwt.realm"]);

            JwkProviderBuilder(URL(url))
                    .build()
        }
    }))

    embeddedServer(Netty, env).start(wait = true)
}