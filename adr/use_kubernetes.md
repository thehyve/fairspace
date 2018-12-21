# Use kubernetes for container orchestration

* **Status**: accepted

* **Context**: For running and scaling our microservices, we need methods to orchestrate our components. A common level 
of orchestration is using containers and Kubernetes (k8s) is a widely used (maybe even a de-facto standard) way of doing so.
  
  Kubernetes provides a provider-agnostic way of orchestrating containers with a clear and simple declarative way of describing
  the desired state. Is has a rich ecosystem of supporting tools (such as helm) and is widely supported on all cloud
  providers as well as on premise.

* **Decision**: we will orchestrate our microservices using kubernetes. For deployment, we use helm charts.    

* **Consequences**: setting up our environment requires knowledge of kubernetes. Kubernetes intricacies can also affect the stability of our system. 
  
  Also, for operations we need to have people with good kubernetes knowledge  
