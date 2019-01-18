# A Proposal for Improving Data Integrity Guarantees

*Context*

First of all, I would like to analyse the existing Fairspace architecture from the data integrity point of view.

**How do we keep data consistent?** 

Long story short: we don’t.

Currently data and metadata in Fairspace is dispersed over a variety of storages:

- Data files are stored in a regular filesystem and can be stored somewhere else like S3 buckets
- Metadata is stored in an RDF database
- The mapping between the files and the metadata is stored in a separate SQL database
- Access permissions and some top-level information about collections is stored in another SQL database
- User profiles are stored in Keycloak
- JupyterHub uses its own storage for users’ home directories
- ... and stores user sessions in a relational database
- We’re about to introduce a new storage for Pluto


Even if we exclude Keycloak and JupyterHub from the picture, we will have to deal with at least four different persistent storages. None of them contains full information and can act as a single point of truth. Each has its own transaction model. For example, the metadata storage guarantees ACID transactions with the highest possible isolation level (serialized), buth the file storage doesn’t even provide atomicity. Many operations which should be atomic, such as creation of a collection involve modification of data stored in multiple storages. If such an operation fails somewhere mid-way, the system will be left in an inconsistent state. An inconsistent state can also be a result of one logical piece of data being simultaneously edited by two or more users. (Remember, what can go wrong will go wrong). At the moment we don’t have any distributed transaction mechanism or any other solution or plan how to address this problem. Actually, given the differences between the transactional models, it’s almost impossible to come up with such a solution.  

Data loss prevention also seems to be an almost unsolvable problem, as each of the persistent storages should be replicated and there must be a way to restore data in case of a failure in each and every storage. 

The absence of a unified data model also contributes to the architectural complexity. Most services have bi-directional data dependencies on each-other and have to use multiple APIs (REST, JSON-LD, SPARQL, WebDAV).

**Does Fairspace facilitate reproducible research?**

Unfortunately, it doesn’t. All data and metadata within Fairspace is mutable, meaning that each and every piece of data or metadata can be removed or overwritten. There’s no way to go back in time and to re-run your workflow with exactly same data or to see a difference between two versions of a dataset. There’s no versioning or hashing. Of course, we could say, that data within Fairspace is mutable, but becomes immutable when you publish it to Dataverse, but that would mean that we facilitate reproducible research outside of Fairspace. Isn’t that ironic?

Extensive logging would in principle allow to track data modification (although in most cases it would remain unnoticed), but not to prevent data loss. Not only files, but also patient- or sample-level metadata can be modified. Situation with metadata is worse, as we don’t have any access restriction mechanism for it. Anyone having access to Fairspace can read or modify any metadata belonging to other groups. Contrary to most of relational databases, the RDF storage which we use to store metadata doesn’t have any notion of user permissions.  AFAIK, we don’t have any idea how to solve that.

We don’t have any measures preventing accidental or malevolent deletion or modification of files and metadata and don’t have any way of recovering lost data. What makes the situation even worse, is the fact that the behavior of the front-end metadata editor makes accidental modification of metadata very easy and unnoticeable.

We don’t enforce logical data consistency. Newly created metadata entities such as patients or biological samples are completely uninitialized but immediately become visible to all users in the systems. There’s no way guarantee that mandatory properties are properly initialized before a new entity becomes visible. It’s not possible to apply changes to multiple metadata properties even belonging to single metadata entity atomically, intermediate states become visible to other users. For example if you have an entity John Smith with two properties {company: “IBM”, position: ”lead architect”}, you cannot reflect changes in John Smith’s career, let’s say to {company: “TheHyve”,  position: “junior developer”}  without making one of two intermediate inconsistent states (either {company: “IBM”, position: ”junior developer”} or {company: “TheHyve”, position: ”lead architect”}) temporarily visible to other users. Now imagine that the transient state has been picked up by some data processing workflow.

Is it at least deterministic? Is it possible to predict If you deploy an instance of Fairspace and upload a test dataset, then remove it, re-deploy and re-upload the same dataset, will we get two identical states? Not at all! First of all, we assign randomly generated URIs to files and directories, so that every file would get a new URI. We also rely on database-generated ids for collections, which can also result in distinct URIs. These two issues are relatively easy to fix, but there’s also a more complicated source of problems. Creation of a collection, a file or a directory involves  changes in many different places: the file storage, the metadata database, and a couple of relational database. The problem is that every database is governed by a separate microservice, which communicate with each other by sending asynchronous notifications. If you sequentially upload a file with one HTTP request and apply some metadata changes with another HTTP request, there’s no guarantee that metadata changes caused by the first request will be applied before changes made by the second, meaning that all kinds of data modification races are possible. It might seem to be very unlikely, but such situations will happen in production.

**Backup and restore?**

Currently our CI environment crashes (needs manual intervention) a few times a week, and almost every time that leaves the system in some inconsistent state, so we just delete all data and metadata and start over with an empty environment. We don’t have any backup and restore solution  and finding such a solution can be very problematic due to the vast number and variety of persistent data storages, on of which can serve a single point of truth. Having nightly full disk backups is definitely not an option for a cloud-base deployment being accessed from different time zones.

**Access management**

Currently access to files is restricted, but all users have unrestricted write access to all metadata entities, even logically belonging to other collections. It’s clear that we need to implement an universal access restriction mechanism, which would be applied to metadata, files and other types of resources.


*Decision*


The proposed solution will focus on three types of data: a) file-based datasets, considered immutable, b) schema-less metadata, updated more frequently than files, c) private frequently-updated files, e.g. not-yet-published computational notebooks, drafts, private notes etc. Last type of data can be hosted and managed by JupyterHub which in addition to computational notebooks, supports editing of text and tabular data files and in fact provides users with virtual Linux terminals. This data for personal use is in fact not different from files stored on user’s laptop. Regular automatic backups would be a nice security measure anyway.  

This leaves with two different types of data: files and RDF metadata. The plasticity of RDF allows it to host all system information such as user permissions as well. RDF databases are schemaless and designed to be multi-tenant, i.e. to be able to host (meta)data from different domains.

1. Limit persistent data managed by Fairspace to two types: files and RDF metadata. Move all data currently stored in SQL databases to the metadata database. 
2. Store physical files on some kind of immutable, add-only (content addressable?) storage (S3, Arvados Keep, etc). Each version of a file would be accessible forever. Of course, we will need to make sure that the underlying file storage is failure proof, but there's a plenty of options for that.
3. Store logical directory structure in the metadata database. File visibility is controlled by the metadata. One file version could be shared between (mounted into) multiple directories. One virtual directory would be able to contain files stored on different physical storages.
4. Use serializable ACID transactions provided by the metadata storage for file operations. Such operations as directory copying will result in one transactional update of te metadata storage. File uploads will first save data to the file storage and then mount the uploaded files into the directory structure stored in the metadata database. Failed uploads would remain invisible to the users
5.  Serializability of metadata transactions and immutability of the file storage will make it very easy to implement such features as backups, recovery, rollbacks, audit and even time travelling.
As the immutable, add-only file storage will always preserve all versions, we will only need to save metadata transactions to a persistent log, which could be stored on the same file-storage as data files. The transaction log will consist of a growing number of relatively small chunks. Committed transactions are persisted to the active chunk, which is stored on a regular file system allowing file appends. When it exceeds certain size limit, it gets stored on the immutable file storage and a new active chunk is created. As I said before, there’s a plenty of different failure-proof storage backe-ends, but if we decide to implement our own, that shouldn’t be very difficult. Incremental backups would be a natural choice due to the append-only nature of the storage. There’s no need to store the metadata database itself, as it’s mere a snapshot of the transactional log. 
6. Every write transaction effectively consists of two lists, namely of deleted and added statements. That makes reverting of a committed historical transaction as simple as creation of a new transaction with the two lists swapped.
7. Implement access restriction system on the metadata level. Access not only to file-level metadata, but also to such entities as patients should be properly restricted. At the same time, patients or samples or even files (see above) can be shared between collections. It’s a very complex task deserving a separate proposal. 

*Status*

Rejected

*Consequences*
 
 The proposed solution will simplify the data model of Fairspace,  make it more metadata-centric, and  provide strong data integrity guarantees, i.e. serializable ACID transactions for all metadata and file operations. It will also bring us such features as  backup-and-restore and audit log almost for free.
  Apparently, most difficult to implement is the metadata-driven filesystem(s). However, it shouldn’t be a too complex task. For comparison, both existing implementations of WebDAV server filesystems are about 300 LOC long. 



