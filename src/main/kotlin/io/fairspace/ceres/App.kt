package io.fairspace.ceres

import com.auth0.jwk.JwkProviderBuilder
import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import io.fairspace.ceres.repository.ModelRepository
import io.ktor.server.engine.commandLineEnvironment
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import org.apache.jena.tdb2.TDB2Factory
import org.koin.dsl.module.applicationContext
import org.koin.standalone.StandAloneContext.startKoin
import java.util.concurrent.TimeUnit

val runtimeContext = applicationContext {
    bean { ConfigFactory.load()}
    bean { TDB2Factory.connectDataset(get<Config>().getString("jena.dataset.path")) }
    bean { ModelRepository(get()) }
    bean { JwkProviderBuilder(get<Config>().getString("authentication.jwt.issuer"))
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build() }
}

fun main(args: Array<String>) {
    startKoin(listOf(runtimeContext))
    embeddedServer(Netty, commandLineEnvironment(args)).start(wait = true)
}