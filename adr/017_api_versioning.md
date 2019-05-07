# API Versioning

* **Status**: accepted

* **Context**: 
Our current APIs are only being used by our frontend and not in an production environment. In the near future
we want to provide a stable API for other parties to talk to. This requires a stable API. At the same time,
the development of new features requires us to have some flexibility in our APIs.

* **Decision**: 
  * We will add a version number to our APIs, based on the URL. 
  
    There will be a version number infix just after `/api`, with `v` in front.
  * The version number will be a positive integer
  * All APIs will be versioned, including SPARQL and webdav endpoints. 

  Example APIs would include:
  `/api/v1/metadata`
  `/api/v2/meta-vocabulary`
  `/api/v1/collections`

* **Consequences**:
  * There are many [alternative ways](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/) of doing API versioning,
  which we do not choose. Having a clear URI including the version number makes
  it easy to reason about and to debug requests. Implementing a separate URI is also simpler than having to handle
  HTTP headers within the different services. Also, the main argument against having the version number in the URI is that is
  breaks the RESTfulness of the API (as resources are not uniquely identified anymore). Our APIs already do not follow
  the RESTful pattern, so this is not a problem.
  
  * We will have to update our application and configuration to include `/v1/` in all APIs.
  
  * We have to carefully consider whether API changes break backward compatibility and whether the version number should be updated.  
   
