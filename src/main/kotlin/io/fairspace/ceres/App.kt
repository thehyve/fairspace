package io.fairspace.ceres

import com.auth0.jwk.JwkProviderBuilder
import io.fairspace.ceres.repository.ModelRepository
import io.ktor.server.engine.*
import io.ktor.server.netty.Netty
import org.apache.jena.tdb2.TDB2Factory
import org.koin.dsl.module.applicationContext
import org.koin.standalone.StandAloneContext.startKoin


fun main(args: Array<String>) {
    val env = commandLineEnvironment(args)
    val cfg = env.config

    startKoin(listOf(applicationContext {
        bean { TDB2Factory.connectDataset(cfg.property("jena.dataset.path").getString()) }
        bean { ModelRepository(get()) }
        bean { JwkProviderBuilder(cfg.property("authentication.jwt.issuer").getString()).build() }
    }))

    embeddedServer(Netty, env).start(wait = true)
}