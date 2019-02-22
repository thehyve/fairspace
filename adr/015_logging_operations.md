# Functional logging of (file) operations

* **Status**: proposed

* **Context**: Our system consists of several APIs that provide access to data or metadata or allows modifying it. We want to provide
  a way to log the actions performed on the system. This logging should allow for (certain) users to analyse who did what in the system 
  from a functional perspective. Examples of this type of logging would be: 
  
  * user John has downloaded file X
  * user Ygritte has given access to user Sander on Collection MyCatVideos
  * bot FacebookFriendUpdater has updated metadata on entity The Boss (http://workspace/iri/1234)
  
  Please note that this logging is related to, but still distinct from technical application logging or transaction logging:
  * technical application logging contains much detailed technical information that can be used for debugging or troubleshooting. 
    This makes it difficult to retrieve the relevant information from the logging. Also, if events don't have technical relevance 
    (e.g. someone downloaded something) then the event will probably not be logged, or is not logged properly to retrieve relevant
    information from it (e.g. HTTP access logs)
  * the transaction log contains only things that have changed in the database. For that reason it does not include any read operations
    which are relevant to the functional logging. Also, the database itself should not be concerned about functional information on 
    what a transaction is actually about. That should be the concern of the high-level apis. Finally, the transaction log has a different
    responsibility from functional logging (i.e. ensuring consistency, backup mechanism vs. searching and showing logging) and for that 
    reason should not be treated the same.

* **Decoupling**: Many parts of the application will perform operations for which logging is required. This includes all high-level apis as
  they are currently present. However, the API functionality is not dependent on the logging. In fact, the application components
  do not even have to know whether anything is being logged, and how that is being done. 
  
  A very common pattern to apply in such a case is an event-driven architecture. In this case, the high-level APIs would emit events
  (e.g. 'user x has downloaded file Y' or 'bot Z has updated the metadata for entity A'). The high-level APIs would not need to know who
  handles the events and what happens to them. There would be a different component that listens to the events and writes them
  to the log. That component does not need to know who has emitted the events, but is only responsible for handling them. 
  
  Setting up the system in such a way makes it very loosely coupled, as the components do not know about eachother. This makes it very easy
  to changes any of the components, without the other one knowing about it. It would also be very easy to extend the functionality, for example
  by sending notifications (emails) for certain events, or updating metadata when the vocabulary changes.

* **Responsibilities**
  The components that are responsible for performing the action itself (e.g. the high-level apis) should emit events that contain all the 
  necessary information for logging, as they are the only components that (should) know about the semantics of the change. The events include 
  at least a human-readable description as well as (optional) links to related entities. e.g. the user performing the action, the collection 
  that is updated and/or the user that gets access to an entity. 
  
  There will be a separate logging component that is responsible for handling the emitted events and storing them persistently. This component
  does not have to know about the actual semantics of the actions that were performed, but should store the events in a generic way. This
  component would also provide the apis to show or search the logs.

* **Decision**: 
  * Functional logging will be implemented separate from technical application logging and transaction logging
  * Functional logging will be implemented on an event-driven architecture
  * High level apis are responsible for emitting events about any action performed
  * A separate component is responsible for storing logs about events in a persistent manner

* **Consequences**: 
  * The system will need some kind of event-bus. In the recent past we have used rabbitmq for this.
