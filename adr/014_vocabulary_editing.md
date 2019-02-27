# Vocabulary editing

* **Status**: proposed

* **Context**: The vocabulary contains information on the datamodel that we use for our metadata. One of the selling points of
    fairspace is that the datamodel is flexible and can be changes by (certain) users. For that reason we need a way to 
    store and update the vocabulary on the fly.
    
    The most straightforward place to store the vocabulary is in a separate graph in the metadata database. This allows
    for simple storage leveraging the advantages of the current setup. Also, in the future it allows for combining the 
    vocabulary with the metadata itself. 
    
    Ensuring consistency of the vocabulary is a responsibility for the backend application. For that reason, it makes
    sense to expose a fine-grained API with specific vocabulary methods, such as adding a class, modifying a property etc. 
    instead of only an endpoint to change the full vocabulary.
    
    The backend must also make sure that the metadata and the vocabulary are consistent. For example, if the user tries to 
    add a metadata entity with an unknown class or where the datatype is invalid, it should be prohibited.
    
    When the vocabulary is being updated, the system will verify that any property (data property or object property) that is 
    being updated, is not used. If a property is already being used, then any updates to that property will be prohibited for
    the sake of simplicity. This avoids more complicated checks whether an update would be consistent with existing metadata,
    that would have severe consequences on performance.  

* **Implementation**: The implementation of the consistency checks is not straightforward. One possible implementation would use
    [RDFS](https://jena.apache.org/documentation/inference/#rdfs) or [OWL](https://jena.apache.org/documentation/inference/#owl) 
    reasoners to verify consistency. However, these reasoners are primarily focussed on inference. For example, say that _age_ is a 
    property belonging to _person_ according to the vocabulary. Then, when a _cat_ is added with _age_ 2 to the metadata, the
    reasoner will not say it is invalid, but it will say that the _cat_ is also a _person_. There are probably ways around this
    default behaviour, but it will at least require some effort.
    
    Another approach would be to implement consistency checks ourselves. This would be feasible, as our vocabulary only has a 
    limited set of functionality. The main thing to check for consistency is the domain and range of each property, which is not
    very complicated.

    Yet another way would be to use the W3C standard [SHACL](https://www.w3.org/TR/shacl/). It provides a way to specify 
    constraints on an RDF model. Using this standard we can specify the constraints we need on our vocabulary. There is 
    a library that connects [SHACL validation with Apache Jena](https://github.com/TopQuadrant/shacl).
    RDF4J also seems to have [built-in support for SHACL validation](https://github.com/eclipse/rdf4j/issues/743). 
    
    Either way, performing the consistency checks will be a burden for performance and complexity of the system. However, using
    SHACL seems to be a straight-forward and standards-compliant way of performing the validation.     

* **Decision**: 
  * The vocabulary is stored in a separate graph in the metadata database.
  * The vocabulary is structured based on the [SHACL](https://www.w3.org/TR/shacl/) w3c standard.
  * The vocabulary API provides fine-grained APIs for modifying the vocabulary
  * The vocabulary API ensures internal consistency of the vocabulary
  * The vocabulary API ensures consistency between the data and the vocabulary by prohibiting any vocabulary changes 
    on properties that are used in the current metadata.
  * The metadata API ensures consistency between the data and the vocabulary by prohibiting any metadata changes changes 
    that conflict with the vocabulary, by leveraging existing SHACL validation libraries.

* **Consequences**: 
  * Other parts of the system (e.g. metadata api or frontend) must be aware of the fact that the vocabulary can change.
  * The metadata is restricted to the information model described in the vocabulary 
  * The performance will be affected by doing consistency checks for every write to the metadata model or the vocabulary.
