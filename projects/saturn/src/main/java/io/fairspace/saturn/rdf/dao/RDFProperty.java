package io.fairspace.saturn.rdf.dao;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;

/**
 * Defines an associated RDF property for an entity field
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(value = FIELD)
public @interface RDFProperty {
    /**
     *
     * @return The property IRI
     */
    String value();

    /**
     * @return true if field is mandatory
     */
    boolean required() default false;
}
