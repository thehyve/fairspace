package io.fairspace.ceres.config

import io.fairspace.ceres.web.converters.JsonLdModelConverter
import io.fairspace.ceres.web.converters.ResultSetConverter
import org.apache.jena.query.ResultSet
import org.apache.jena.rdf.model.Model
import org.springframework.context.annotation.Configuration
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageConverter
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.servlet.config.annotation.EnableWebMvc
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@EnableWebMvc
@Configuration
class WebMvcConfiguration : WebMvcConfigurer {
    override fun extendMessageConverters(converters: MutableList<HttpMessageConverter<*>>) {
        converters.add(0, JsonLdModelConverter())
        converters.add(1, ResultSetConverter())

        // Remove the default Jackson converter, and add another one that explicitly does
        // not handle json-ld or sparql
        val jacksonConverter = converters.find { it is MappingJackson2HttpMessageConverter }
        if(jacksonConverter != null) {
            converters.remove(jacksonConverter)

            converters.add(object : MappingJackson2HttpMessageConverter() {
                override fun canWrite(clazz: Class<*>, mediaType: MediaType?): Boolean {
                    if(Model::class.java.isAssignableFrom(clazz) || ResultSet::class.java.isAssignableFrom(clazz))
                        return false

                    return super.canWrite(clazz, mediaType)
                }
            })
        }


        super.extendMessageConverters(converters)
    }
}