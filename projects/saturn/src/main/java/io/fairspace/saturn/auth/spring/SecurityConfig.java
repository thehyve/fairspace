package io.fairspace.saturn.auth.spring;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http.authorizeHttpRequests((authorize) -> authorize
//                        .requestMatchers(req -> req.getServletPath().contains("/api/health"))
//                        .permitAll()
//                        .requestMatchers(req -> req.getServletPath().endsWith("/favicon.ico"))
//                        .permitAll()
//                        .anyRequest()
//                        .authenticated())
//                .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()))
//                .sessionManagement(
//                        (sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .exceptionHandling((exceptionHandling) ->
//                        exceptionHandling.authenticationEntryPoint(new UnauthorizedEntryPoint()));
//        //                .cors(Customizer.withDefaults()) // todo: check that cors enabled
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests((authorize) -> authorize
//                        .requestMatchers(req -> req.getServletPath().contains("/api/health")).permitAll()
//                        .requestMatchers(req -> req.getServletPath().endsWith("/favicon.ico")).permitAll()
//                        .anyRequest().authenticated()
//                )
//                .exceptionHandling((exceptionHandling) -> exceptionHandling
//                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint()));
        return http.build();
    }

    //todo:  add user service referring to Jena
}
