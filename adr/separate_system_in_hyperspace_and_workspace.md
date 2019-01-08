# Separate Fairspace into 2 components: hyperspace and workspace

* **Status**: accepted

* **Context**: The system we are building has the notion of a workspace. A workspace is a place where researchers can share data and metadata. Each workspace is completely separate from other workspaces for security reasons.
  The vision is that workspaces can be created on the fly by administrators. 

  To manage the workspaces, we need some common components to manage workspaces as well as for resource management and billing. Other components that can be shared between workspaces are authentication and infrastructure components (e.g. a messagebus).
  This part is called the hyperspace.
  
* **Decision**: separate Fairspace into 2 separate subsystems:

  * a **hyperspace** that contains common components that can be shared among workspaces
  * a **workspace** that if fully separated from other workspaces and (optionally) uses components from the hyperspace.       

  Please note that there is a third subsystem containing monitoring and maintenance tools (jaeger, filebeat, prometheus etc.). This subsystem is called _opsspace_.
* **Consequences**: we need 2 different steps for installing our system, while these steps should be coordinated. This makes
the setup more complex.
