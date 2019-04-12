# Metadata components

The metadata components are divided into a number of groups:

- The `/common` subdirectory contains all generic components that can be used for both 
  metadata and vocabulary editing. These components are not aware of the metadata or vocabulary
  state in redux. Generic components are indicated by the prefix `LinkedData`.
  
  The common components contain logic for form building. The state of a form is stored in redux
  (see [LinkedDataEntityFormContainer.js](common/LinkedDataEntityFormContainer.js)). This form 
  state is being shared between different types of linked data editing.
- The `/metadata` subdirectory contains the components that are used specifically for metadata editing.
  Its main purpose is to connect the generic components to the metadata state (see 
  [jsonLdBySubjectReducers.js](../../reducers/cache/jsonLdBySubjectReducers.js))
- The `/vocabulary` subdirectory contains the components that are used specifically for vocabulary editing.
  Its main purpose is to connect the generic components to the vocabulary state (see 
  [vocabularyReducers.js](../../reducers/cache/vocabularyReducers.js))
