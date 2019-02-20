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
    
    The backend must also make sure that the metadata and the vocabulary are consistent. For example, if a class is removed
    from the vocabulary, there should not be any metadata entities with that class anymore. The other way around is also true.
    If the user tries to add a metadata entity with an unknown class, it should be prohibited. 

* **Decision**: 
  * The vocabulary is stored in a separate graph in the metadata database.
  * The vocabulari API provides fine-grained APIs for modifying the vocabulary
  * The vocabulary API ensures internal consistency of the vocabulary
  * The vocabulary API ensures consistency between the data and the vocabulary by prohibiting any vocabulary changes 
    that conflict with existing metadata.
  * The metadata API ensures consistency between the data and the vocabulary by prohibiting any metadata changes changes 
    that conflict with the vocabulary.

* **Consequences**: 
  * Modifying the vocabulary on a running instance would require API calls, instead of just deploying a new version
  * Other parts of the system must be aware of the fact that the vocabulary can change.
  * The metadata is restricted to the information model described in the vocabulary 
