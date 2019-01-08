# Use microservices architecture

* **Status**: accepted

* **Context**: While setting up our system, we identified a number of separate functionalities. These include storage, metadata, authentication and authorization. 
We want our system to be properly scalable, and the distinct parts of the application will have different load and performance requirements. 

* **Decision**: we will separate our application into small, distinct, reusable components.  

* **Consequences**: using microservices increases the complexity of the system and the deployments. Also, within the
distributed system we will have to handle distributed services. However, we can use different languages and technologies
for different parts of the system, based on the specific needs.  
