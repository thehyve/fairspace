# Project dimension

* **Status**: proposed

* **Context**: 
  Our current application works with a level of collections within a workspace for grouping files. There is a need for
  an additional layer on top of the collections ('projects'), which groups a set of collections and associated metadata. 
  Each project should be able to have its own metadata model. 

  The current approach of storing all information in a single Apache Jena database does not provide
  the necessary performance needed to support many projects and many users. The main issues with the performance
  are caused by the fact that a write operation on the database blocks any other write operation. This means that
  if there is a write operation that takes 10 seconds, all other write operations (even the smallest ones) would
  have to wait for 10 seconds to respond.
  
* **Solution**: 
  As the projects data and metadata is independent, they can be stored separately. We will use one jena database per project
  to store the information for that project. This will decrease the performance issues, as the write operations will
  only block other write operations within the same project. For each project we expect only a very limited number of
  concurrent users, so the impact of blocking operations will be very low.
  
  In addition to the databases per project, saturn will also contain:
  * a metadata store with shared metadata along with a vocabulary (could be a special project)
  * a place to store a list of projects
  * a place to store authorizations on projects
  * an API to manage the projects
  * an API to manage the authorizations on projects
  
  The frontend will be augmented with an interface to manage the projects within a workspace.
  
  Each project will store its information in a separated ES index. This results in smaller indexes and fast ES responses.
  Such a division also enables our application to query only those indexes that a user has access to.  
    
* **Alternatives considered**
  * Store each project in its own workspace. This would also bring the same performance improvements as the proposed
    solution. However, the impact on resource usage would be very large (in terms of memory and disk usage). Also, 
    the integration with helm turned out to be quite complex due to the asynchronous nature of the operations and
    is fragile at times
  * Add a different SPARQL storage backend. There is a number of other storage backends that could be used (e.g. 
    BlazeGraph or StarDog). The main disadvantage of using these storage backends is the overhead in communication with
    the backends as well as the lack of transactional behaviour when using the `RDFConnectionRemote` class.
  * Use a different (graph/sql) storage backend. Other storage backends provide other locking mechanisms and can be
    more scalable. However, as our application very much depends on SPARQL for its queries and some of the logic, this 
    would have a very large impact on the application. Also, other backends may not provide us with certain RDF 
    characteristics (inference, SHACL validation).  

* **Decision**: 
  * A project level will be introduces within the workspace by storing all information for a project in a
    separate jena database.
  * The project identifier is passed to the backend in the API urls. For example, all urls in `/api/v1/...` will
    be exposed in `/api/v1/[project-id]/...`.

* **Consequences**:
  * Saturn will be capable of handling a number of projects per service.
  * A workspace can be scaled by running multiple instances of saturn, each managing a different shard of the projects.
  * The current frontend can be reused as a 'project' UI, handling all data/metadata within a project
  * Additional logic is required for implementing the projects level.
