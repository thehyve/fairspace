package io.fairspace.saturn.rdf.dao;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;

@Retention(RetentionPolicy.RUNTIME)
@Target(value = FIELD)
public @interface RDFProperty {
    /**
     *
     * @return The property IRI
     */
    String value();

    boolean required() default false;
}
