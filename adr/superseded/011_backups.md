# Backups

* **Status**: rejected

* **Context**: A backup strategy is needed mainly because we want to recover from 
  'disasters' (e.g. failing hardware or inconsistent data due to software bugs). 
  As a consequence of storing the data in storages provided by cloud providers, 
  we can leverage their safeguards. For example, azure premium disks are already 
  3-way replicated, and cosmos db provides redundancy and high availability by itself. 
  These measure will solve the large majority of failures covered by a backup strategy.
               
  However, this replication and redundancy does not help in case there are accidental 
  bugs in our system that cause inconsistent data. Nor does it work automatically on
  on-premise installations. 

* **Decision**: Implement backup strategy by putting the system into a read-only state 
  for a short moment, wait for all messages to be passed along to all services and 
  create a backup of all datastores. 
  
* **Consequences**:  
  * This requires a way to put all systems in a readonly state. As we do not expect 
    very high usage at each time a day, the impact on usage is only little.
  * This backup strategy has a strong preference for a low number of separate datastores

