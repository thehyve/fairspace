package io.fairspace.ceres

import org.apache.jena.query.ResultSetFactory
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.vocabulary.VCARD

object TestData {
    val personURI = "http://somewhere/JohnSmith"
    val givenName = "John"
    val familyName = "Smith"
    val fullName = "$givenName $familyName"

    val model = ModelFactory.createDefaultModel().apply {
        createResource(personURI)
                .addProperty(VCARD.FN, fullName)
                .addProperty(VCARD.N,
                        createResource()
                                .addProperty(VCARD.Given, givenName)
                                .addProperty(VCARD.Family, familyName))
    }

    val resultset = ResultSetFactory.makeResults(model)
}