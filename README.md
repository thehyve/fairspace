# Fairspace

Fairspace is a secure place for managing research data.
Research teams have their own workspaces in which they
can manage research data collections.
Researchers can upload directories and files to data collections.
Data access is organised on data collection level.
Collections can be shared with other teams or individual researchers.
Also, collections can be published for all researchers in the organisation.

Collections and files can be annotated with descriptive metadata.
The metadata is stored using the [Resource Description Framework (RDF)] in
an [Apache Jena] database.
For the metadata a data model can be configured that suits
the data management needs of the organisation.
The data model is specified using the [Shapes Constraint Language (SHACL)],
see the section on [Data model and view configuration].
Descriptive metadata entities (e.g., subjects, projects, samples) should be added to the database by a 
careful process, ensuring that duplicates and inconsistencies are avoided and
all entities have proper unique identifiers.
The application provides overviews of the available metadata entities.
In the collection browser, researchers can link their collections and file to these entities
or add textual descriptions and key words.

## Table of contents

- [Structure and terminology]
- [Usage]
  - [User interface]
  - [Interfaces for accessing and querying data (API)]
- [Installation and configuration]
- [Design]
- [Data model and view configuration]

[Structure and terminology]: #structure-and-terminology
[Usage]: #usage
[User interface]: #user-interface
[Interfaces for accessing and querying data (API)]: #interfaces-for-accessing-and-querying-data-api
[Installation and configuration]: #installation-and-configuration
[Design]: #design
[Data model and view configuration]: #data-model-and-view-configuration


# Structure and terminology

We define the following core entities of the data repository:

- *Users*: individual users in the organisation, looking for data,
  contributing to data collections or managing data.
- *Workspaces* (for projects, teams): entities in the system to organise data collections and data access.
- *Collections*: entities in the system to group data files.
  These are the minimal units of data for data access and data modification rules.
- *Files*: The smallest units of data that the system processes.
  Files always belong to a single collection.
  Files can be added, changed and deleted, but not in all collection states.
  Changing a file creates a new version.
  Access to a file is based on access to the collection the file belongs to.
  Files can be organised in *Directories*, which we will leave out of most descriptions for brevity.

![Diagram](docs/images/diagrams/Collections%20access%20model.png)

The diagram above sketches the relevant entities and actors.
The basic structure consists of users, workspaces, collections and files as represented in the system.
The organisational entities of projects and teams do not play a role in the access rules,
but are important for understanding if the proposed model works in reality.
Collections are the basic units of data access management.
A collection is owned by a workspace.
The responsibility for a collection is organised via the owner workspace:
members of the owner workspace can be assigned as editors or managers of the collection.
This reflects the situation where in an organisation, a data collection belongs to a project or a research team.
This way the workspace represents the organisational unit that is responsible for a number of data collections.
Data can be shared with other workspaces or individual users (for reading)
and ownership may be transferred to another workspace
(e.g., in the case the workspace is temporary, or when the organisation changes).

The *data catalogue* contains all the metadata, which is visible for all users with catalogue access.
Users with write access can add metadata to the catalogue. Data stewards can edit contributions.
Metadata on collection and file level is protected by the access policy of the collections.

*User administration* is organised in an external component: Keycloak.
A back end application is responsible for storing the data and metadata,
and for providing APIs for securely retrieving and adding data and metadata using standard data formats.
A user interface application provides an interactive file manager and (meta)data browser
and data entry forms based on the back end APIs.
Besides the data storage and data management, Fairspace offers *analysis environments* using [Jupyter Hub].
In Jupyter Hub, the data repository is accessible. Every user has a private working directory.
We do no assumptions on the structure of the data or on the permissions of the external file systems
that are connected to the data repository and referenced in the data catalogue.
The organisation structure may be replicated in the different systems in incompatible ways,
and the permissions may not be aligned.

## Workflow and access modes

During the lifetime of a collection, different rules may be applicable for data modification and data access.
In Fairspace, collections follow a workflow with the following statuses:
- *Active*: for the phase of data collection, data production and data processing;
- *Archived*: for when the data set is complete and is available for reuse;
- *Closed*: for when the data set should not be available for reading, but still needs to be preserved;
- *Deleted*: for when the data set needs to be permanently made unavailable.
  This status is irreversible. There is one exception to this rule &ndash; for the sake of data loss prevention, in special cases, administrators can still undelete a collection that was already deleted.

In these different statuses, different actions on the data are enabled or disabled. Also, visibility of the data and linked metadata depends partly on the collection status.
We also distinguish three access modes for reading and listing files in a collection (where listing also includes seeing the metadata):
- *Restricted*: only access to explicitly selected workspaces and users;
- *Public metadata*: the collection and its files are visible, metadata linked to them is visible for all users;
- *Public*: the files in the collection are readable for all users.
  This mode is irreversible. There is one exception to this rule &ndash; there might be a special situation, resulting from e.g. a legal reason, when a collection has to be unpublished. This action is available to administrators, but it is highly discouraged, since the collection (meta)data may already be referenced in other systems.

The statuses and access modes, and the transitions between them
are shown in the following diagram.

![Collection editing and publication workflow](docs/images/diagrams/Dataset%20workflow%20and%20visibility%20modes.png)

## Roles and permissions
We distinguish the following roles in the solution:
- *Administrator*: can create workspaces, assign roles and permissions;
- *Data steward*: can edit and delete metadata, overwrite and delete collections and files;
- *Internal user*: any internal user can view public metadata, workspaces, collections and files
  (Researchers, data scientists, bioinformaticians);
- *External user*: external users can only view their own workspaces and collections.

Workspaces are used to organise collections in a hierarchy. On workspace level there are two access levels:
- *Manager*: can edit workspace details, manage workspace access and manage access to all collections that belong to the workspace;
- *Member*: can create a collection in the workspace.

Access to collections and files is managed on collection level. We distinguish the following access levels on collections:
- *List*: see collection, directory and file names and metadata properties/relations;
- *Read*: read file contents;
- *Write*: add files, add new file versions, mark files as deleted;
- *Manage*: grant, revoke access to the collection, change collection status and modes.

Access levels are hierarchical: the *Read* level includes the *List* level;
the *Edit* level includes *Read* level; the *Manage* level includes *Edit* and *Read* level access.
The user that creates the collection gets *Manage* access.



# Usage

## User interface

### Login

Users are authenticated using [Keycloak], an open-source identity provider
that provides secure authentication methods and can be configured to integrate
with institutional identity providers using user federation or identity brokering,
see the [Keycloak server administration] pages.

The user either logs in directly using Keycloak or is forwarded to a configured
external login:

![Keycloak login](docs/images/screenshots/Keycloak%20login.png)

### Workspaces

Users enter Fairspace on the workspaces page that lists all workspaces.
A workspace represents a team in the organisation that collaborates on research data collections.

![Workspace list](docs/images/screenshots/Workspace%20list.png)

Workspace administrators can edit the workspace overview page and
manage workspace membership. All workspace members can add collections to the workspace.

![Workspace overview](docs/images/screenshots/Workspace%20overview.png)

### Collections

The contents of collections can be navigated in the collections browser.
It behaves like a regular file browser. Click to select a directory or file
and see its metadata, double click to navigate into directories or
open a file.

Access is managed on collection level.
Users with at least write access to a collection can upload files or directories,
rename or delete files, restore old file versions,
and edit the associated metadata. 

![Collection browser](docs/images/screenshots/Collection%20browser.png)

### Metadata

Explore metadata and find associated collections and files.
![Metadata](docs/images/screenshots/Metadata%20view.png)



## Interfaces for accessing and querying data (API)

### Authentication

#### OpenID Connect (OICD) / OAuth2 workflow

Via header, via session.

<details>
<summary>
Fetch token (Python code example)
</summary>

```python
import logging
import requests
import sys
import time

log = logging.getLogger()

def fetch_access_token(keycloak_url: str,
                       realm: str,
                       client_id: str,
                       client_secret: str,
                       username: str,
                       password: str) -> str:
    """
    Obtain access token from Keycloak
    :return: the access token as string.
    """
    params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'username': username,
        'password': password,
        'grant_type': 'password'
    }
    headers = {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    }
    response = requests.post(f'{keycloak_url}/auth/realms/{realm}/protocol/openid-connect/token',
                             data=params,
                             headers=headers)
    if not response.ok:
        log.error('Error fetching token!', response.json())
        sys.exit(1)
    data = response.json()
    token = data['access_token']
    log.info(f"Token obtained successfully. It will expire in {data['expires_in']} seconds")
    return token
```
</details>

#### Basic authentication

Use the `base64` encoded `username:password` in the `Authorization` header.

<details>
<summary>
Authentication (Curl code example)
</summary>

```bash
curl -v -H "Authorization: Basic $(echo -n "${USERNAME}:${PASSWORD}" | base64)" http://localhost:8080/api/users/current
```
</details>

#### Automatic authentication in Jupyter Hub



### Data upload API

Metadata can be specified using: 
- turtle
- json-ld

Example file: `testdata.ttl`:
```turtle
@prefix example: <https://example.com/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix subject: <http://example.com/subjects#> .
@prefix file: <http://example.com/api/webdav/> .
@prefix gender: <http://hl7.org/fhir/administrative-gender#> .
@prefix ncbitaxon: <https://bioportal.bioontology.org/ontologies/NCBITAXON/> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .

subject:s1 a example:Subject ;
           rdfs:label "Subject 1" ;
           example:isOfSpecies ncbitaxon:9606 .

file:coll1\/coffee.jpg
    dcat:keyword "fairspace", "java" ;
    example:aboutSubject example:s1 .
```

<details>
<summary>
Example with Python.
</summary>

```python
import logging
from requests import Session
import sys

log = logging.getLogger()

session = Session()
with open('testdata.ttl') as testdata: 
    response: Response = session.put(f"{server_url}/api/metadata/",
                           data=testdata.read(),
                           headers={'Content-type': 'text/turtle'})
    if not response.ok:
        log.error('Error uploading metadata!')
        log.error(f'{response.status_code} {response.reason}')
        sys.exit(1)
```
</details>


```bash
curl -v
```

### WebDAV


# Installation and configuration

## Local development

Requires:
- yarn
- docker
- Java 15

To run the development version, checkout this repository,
navigate to `projects/mercury` and run

```bash
yarn dev
```

If on MacOS, configure docker logging.... TODO
As env variable, or in `.env` file: `DOCKER_LOGGING_DRIVER=json-file`. 

This will start a Keycloak instance for authentication at port `5100`,
the backend application named Saturn at port `8080` and the
user interface at port `3000`.

At first run, you need to configure the service account in Keycloak.
- Navigate to [http://localhost:5100](http://localhost:5100)
- Login with credentials `keycloak`, `keycloak`
- 
- Grant `realm-management` roles in the Fairspace realm: `view-realm`, `manage-realm`, `manage-authorization`, `manage-users`.

Now everything should be ready to start using Fairspace: 
- Navigate to [http://localhost:3000](http://localhost:3000) to open the application.
- Login with one of the following credentials:

  | Username           | Password     |
  |:------------------ |:------------ |
  | organisation-admin | fairspace123 |
  | user               | fairspace123 |


## Kubernetes

The Fairspace helm chart, which will install and configure a single Fairspace.
See [charts/fairspace/README.md](/charts/fairspace/README.md) for more information.

Instructions for Google Cloud

<details>
<summary>
Instructions for Google Cloud
</summary>

```bash
gcloud container clusters get-credentials fairspacecicluster --zone europe-west1-b
~/bin/helm/helm plugin install https://github.com/hayorov/helm-gcs.git
gcloud iam service-accounts keys create credentials.json --iam-account fairspace-207108@appspot.gserviceaccount.com
export GOOGLE_APPLICATION_CREDENTIALS=/home/pm/test/credentials.json
~/bin/helm/helm gcs init gs://fairspace-helm
~/bin/helm/helm repo update
~/bin/helm/helm fetch fairspace/fairspace --version 0.6.9-SNAPSHOT
~/bin/helm/helm upgrade fairspace-test ./fairspace-0.6.9-SNAPSHOT.tgz
# ~/bin/helm/helm install fairspace/fairspace --namespace fairspace-test --name fairspace-test --version 0.6.9-SNAPSHOT -f ~/test/values.yaml 
```
</details>


# Design

## Storage

RDF database using [Apache Jena] for:
- File metadata
- Permissions
- User metadata

File system data stored as blocks on the file system in append-only fashion.



# Data model and view configuration

Data model defined using the [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/).

- System data model: [system-vocabulary.ttl](projects/saturn/src/main/resources/system-vocabulary.ttl)
- Customisable data model: [vocabulary.ttl](projects/saturn/vocabulary.ttl)
- Taxonomies: [taxonomies.ttl](projects/saturn/taxonomies.ttl)

A schematic overview of the default data model in [vocabulary.ttl](projects/saturn/vocabulary.ttl):
![CDR data model](docs/images/diagrams/CDR%20data%20model.png)

Terminologies as types, entities as types.

Example taxonomy types and entity type:
```turtle
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dash: <http://datashapes.org/dash#> .
@prefix fs: <https://fairspace.nl/ontology#> .
@prefix example: <https://example.com/ontology#> .

example:Gender a rdfs:Class, sh:NodeShape ;
    sh:closed false ;
    sh:description "The gender of the subject." ;
    sh:name "Gender" ;
    sh:ignoredProperties ( rdf:type owl:sameAs ) ;
    sh:property
    [
        sh:name "Label" ;
        sh:description "Unique gender label." ;
        sh:datatype xsd:string ;
        sh:maxCount 1 ;
        dash:singleLine true ;
        fs:importantProperty true ;
        sh:path rdfs:label
    ] .

example:Species a rdfs:Class, sh:NodeShape ;
    sh:closed false ;
    sh:description "The species of the subject." ;
    sh:name "Species" ;
    sh:ignoredProperties ( rdf:type owl:sameAs ) ;
    sh:property
    [
        sh:name "Label" ;
        sh:description "Unique species label." ;
        sh:datatype xsd:string ;
        sh:maxCount 1 ;
        dash:singleLine true ;
        fs:importantProperty true ;
        sh:path rdfs:label
    ] .

example:isOfGender a rdf:Property .
example:isOfSpecies a rdf:Property .

example:Subject a rdfs:Class, sh:NodeShape ;
    sh:closed false ;
    sh:description "A subject of research." ;
    sh:name "Subject" ;
    sh:ignoredProperties ( rdf:type owl:sameAs ) ;
    sh:property
    [
        sh:name "Gender" ;
        sh:description "The gender of the subject." ;
        sh:maxCount 1 ;
        sh:class example:Gender ;
        sh:path example:isOfGender
    ],
    [
        sh:name "Species" ;
        sh:description "The species of the subject." ;
        sh:maxCount 1 ;
        sh:class example:Species ;
        sh:path example:isOfSpecies
    ] .

example:aboutSubject a rdf:Property .

# Augmented system class shapes
fs:File sh:property
    [
        sh:name "Is about subject" ;
        sh:description "Subjects that are featured in this collection." ;
        sh:class example:Subject ;
        sh:path example:aboutSubject
    ] .
``` 

Example taxonomy:
```turtle
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix example: <https://example.com/ontology#> .
@prefix gender: <http://hl7.org/fhir/administrative-gender#> .
@prefix ncbitaxon: <https://bioportal.bioontology.org/ontologies/NCBITAXON/> .

gender:male a example:Gender ;
  rdfs:label "Male" .
gender:female a example:Gender ;
  rdfs:label "Female" .

ncbitaxon:562 a example:Species ;
  rdfs:label "Escherichia coli" .
ncbitaxon:1423 a example:Species ;
  rdfs:label "Bacillus subtilis" .
ncbitaxon:4896 a example:Species ;
  rdfs:label "Schizosaccharomyces pombe" .
ncbitaxon:4932 a example:Species ;
  rdfs:label "Saccharomyces cerevisiae" .
ncbitaxon:6239 a example:Species ;
  rdfs:label "Caenorhabditis elegans" .
ncbitaxon:7227 a example:Species ;
  rdfs:label "Drosophila melanogaster" .
ncbitaxon:7955 a example:Species ;
  rdfs:label "Zebrafish" .
ncbitaxon:8355 a example:Species ;
  rdfs:label "Xenopus laevis" .
ncbitaxon:9606 a example:Species ;
  rdfs:label "Homo sapiens" .
ncbitaxon:10090 a example:Species ;
  rdfs:label "Mus musculus" .
```


[Apache Jena]: https://jena.apache.org/
[Resource Description Framework (RDF)]: https://en.wikipedia.org/wiki/Resource_Description_Framework
[Shapes Constraint Language (SHACL)]: https://www.w3.org/TR/shacl/
[Keycloak]: https://www.keycloak.org/
[Keycloak server administration]: https://www.keycloak.org/docs/latest/server_admin/
[Jupyter Hub]: https://jupyterhub.readthedocs.io/
