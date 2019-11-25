# Folder/Files Structure
The project follows the [feature based approach](https://reactjs.org/docs/faq-structure.html).
Most feature folders contain:
- *API.js
  - Service file to communicate with the backend.
- *Page
  - The main entry point for the feature/route
- Other specialized components specific to the feature

## The rest of the code
- /common (Shared code)
  - /components
    - InformationDrawer (Side panel contains collection info, collaborators/permissions and metadata for selected collection, directories or files)
  - /context (shared/injected state/logic) [Read on React Context](https://reactjs.org/docs/context.html)
  - /hooks (pure logic/state no UI) [Read on React Hooks](https://reactjs.org/docs/hooks-intro.html)
  - /services/Config.js (configuration from backend)
    - /utils (Utility files, pure functions)
- /metadata (could be renamed to linkeddata)
  - Generic components (for metadata and vocabulary) are called LinkedData*.js
  - common (shared components between Vocabulary and Metadata)
    - values (the different form fields, text input, dates, dropdown etc.)
    - LinkedDataEntityForm This component and its child components are probably the most complex areas in the frontend code. Some refactoring might be required in case there is any expected changes and in order to make the code easier to maintain.
  - (LinkedDataContext with 2 providers, one for Vocabulary and one for Metadata)
  - LinkedDataWrapper
    - 2 Wrappers to provide needed values to either metadata or vocabulary
  - UseLinkedData
    - Fetches the entity whether it's part of the metadata or vocabulary, using the provided subject
  - UseFormData
    - Contains the currently loaded form/entity values, changes, validation state and form operations.
  - UseFormSubmission
    - Submits form changes and handles submission errors
  - UseLinkedDataSearch
    - Logic that handles search concerns
  - UseLinkedDataSearchParams
    - Holds metadata/vocabulary search parameters
  - UseMetaVocabulary
    - Loads MetaVcabulary, doesn't need to be a context because it's only loaded by the Vocabulary provider.
- /permissions

## Keep in mind
Not all components/files are covered, mainly the important ones and the need description.

## Other Thoughts
- It would be much better for the workflow if the shared frontend code would be merged into this project. The reason for creating the shared library is to use it with Hyperspace. However, In case of merging Hyperspace with Workspace the team should consider making all of the frontend code in a single project.
