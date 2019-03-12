package io.fairspace.saturn.rdf.dao;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;

/**
 * Defines an associated rdf:type for an entity class
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(value = TYPE)
public @interface RDFType {
    /**
     * @return The rdf:type IRI
     */
    String value();
}
