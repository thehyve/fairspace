/* eslint-disable no-multi-spaces */

// Account
export const FETCH_AUTHORIZATIONS                   = 'FETCH_AUTHORIZATIONS';

// Clipboard
export const CLIPBOARD_CUT                          = 'CLIPBOARD_CUT';
export const CLIPBOARD_COPY                         = 'CLIPBOARD_COPY';
export const CLIPBOARD_PASTE                        = 'CLIPBOARD_PASTE';
export const CLIPBOARD_PASTE_PENDING                = 'CLIPBOARD_PASTE_PENDING';
export const CLIPBOARD_PASTE_FULFILLED              = 'CLIPBOARD_PASTE_FULFILLED';
export const CLIPBOARD_PASTE_REJECTED               = 'CLIPBOARD_PASTE_REJECTED';

// Collection browser
export const SELECT_COLLECTION                      = 'SELECT_COLLECTION';
export const SELECT_PATH                            = 'SELECT_PATH';
export const SET_SELECTED_PATHS                     = 'SET_SELECTED_PATHS';
export const DESELECT_ALL_PATHS                     = 'DESELECT_ALL_PATHS';
export const DESELECT_PATH                          = 'DESELECT_PATH';

// Collections
export const FETCH_COLLECTIONS                      = 'FETCH_COLLECTIONS';
export const INVALIDATE_FETCH_COLLECTIONS           = 'INVALIDATE_FETCH_COLLECTIONS';
export const ADD_COLLECTION                         = 'ADD_COLLECTION';
export const ADD_COLLECTION_PENDING                 = 'ADD_COLLECTION_PENDING';
export const ADD_COLLECTION_FULFILLED               = 'ADD_COLLECTION_FULFILLED';
export const ADD_COLLECTION_REJECTED                = 'ADD_COLLECTION_REJECTED';
export const ADD_COLLECTION_INVALIDATE              = 'ADD_COLLECTION_INVALIDATE';
export const UPDATE_COLLECTION                      = 'UPDATE_COLLECTION';
export const UPDATE_COLLECTION_FULFILLED            = 'UPDATE_COLLECTION_FULFILLED';
export const DELETE_COLLECTION                      = 'DELETE_COLLECTION';
export const DELETE_COLLECTION_PENDING              = 'DELETE_COLLECTION_PENDING';
export const DELETE_COLLECTION_FULFILLED            = 'DELETE_COLLECTION_FULFILLED';
export const DELETE_COLLECTION_REJECTED             = 'DELETE_COLLECTION_REJECTED';
export const DELETE_COLLECTION_INVALIDATE           = 'DELETE_COLLECTION_INVALIDATE';

// Files
export const STAT_FILE                              = 'STAT_FILE';
export const STAT_FILE_PENDING                      = 'STAT_FILE_PENDING';
export const STAT_FILE_FULFILLED                    = 'STAT_FILE_FULFILLED';
export const STAT_FILE_REJECTED                     = 'STAT_FILE_REJECTED';
export const INVALIDATE_STAT_FILE                   = 'INVALIDATE_STAT_FILE';
export const FETCH_FILES                            = 'FETCH_FILES';
export const FETCH_FILES_PENDING                    = 'FETCH_FILES_PENDING';
export const FETCH_FILES_FULFILLED                  = 'FETCH_FILES_FULFILLED';
export const FETCH_FILES_REJECTED                   = 'FETCH_FILES_REJECTED';
export const INVALIDATE_FETCH_FILES                 = 'INVALIDATE_FETCH_FILES';
export const RENAME_FILE                            = 'RENAME_FILE';
export const RENAME_FILE_FULFILLED                  = 'RENAME_FILE_FULFILLED';
export const DELETE_FILES                           = 'DELETE_FILES';
export const DELETE_FILES_FULFILLED                 = 'DELETE_FILES_FULFILLED';
export const DELETE_FILES_REJECTED                  = 'DELETE_FILES_REJECTED';
export const UPLOAD_FILES                           = 'UPLOAD_FILES';
export const UPLOAD_FILES_FULFILLED                 = 'UPLOAD_FILES_FULFILLED';
export const CREATE_DIRECTORY                       = 'CREATE_DIRECTORY';
export const CREATE_DIRECTORY_PENDING               = 'CREATE_DIRECTORY_PENDING';
export const CREATE_DIRECTORY_FULFILLED             = 'CREATE_DIRECTORY_FULFILLED';
export const CREATE_DIRECTORY_REJECTED              = 'CREATE_DIRECTORY_REJECTED';
export const INVALIDATE_CREATE_DIRECTORY            = 'INVALIDATE_CREATE_DIRECTORY';

// Metadata
export const FETCH_METADATA                         = 'FETCH_METADATA';
export const INVALIDATE_FETCH_METADATA              = 'INVALIDATE_FETCH_METADATA';
export const UPDATE_METADATA                        = 'UPDATE_METADATA';
export const UPDATE_METADATA_PENDING                = UPDATE_METADATA + '_PENDING';
export const UPDATE_METADATA_FULFILLED              = UPDATE_METADATA + '_FULFILLED';
export const UPDATE_METADATA_REJECTED               = UPDATE_METADATA + '_REJECTED';
export const COMBINE_METADATA                       = 'COMBINE_METADATA';

// Vocabulary
export const FETCH_VOCABULARY                       = 'FETCH_VOCABULARY';
export const FETCH_META_VOCABULARY                  = 'FETCH_META_VOCABULARY';
export const UPDATE_VOCABULARY                      = 'UPDATE_VOCABULARY';
export const UPDATE_VOCABULARY_PENDING              = UPDATE_VOCABULARY + '_PENDING';
export const UPDATE_VOCABULARY_FULFILLED            = UPDATE_VOCABULARY + '_FULFILLED';
export const UPDATE_VOCABULARY_REJECTED             = UPDATE_VOCABULARY + '_REJECTED';

// Workspace
export const FETCH_WORKSPACE                        = 'FETCH_WORKSPACE';

// UI
export const TOGGLE_MENU                            = 'TOGGLE_MENU';
export const MOUSE_ENTER_MENU                       = 'MOUSE_ENTER_MENU';
export const MOUSE_LEAVE_MENU                       = 'MOUSE_LEAVE_MENU';

// Search
export const COLLECTIONS_SEARCH                     = 'COLLECTIONS_SEARCH';
export const COLLECTIONS_SEARCH_PENDING             = 'COLLECTIONS_SEARCH_PENDING';
export const COLLECTIONS_SEARCH_FULFILLED           = 'COLLECTIONS_SEARCH_FULFILLED';
export const COLLECTIONS_SEARCH_REJECTED            = 'COLLECTIONS_SEARCH_REJECTED';
// +
export const METADATA_SEARCH                        = 'METADATA_SEARCH';
export const METADATA_SEARCH_PENDING                = 'METADATA_SEARCH_PENDING';
export const METADATA_SEARCH_FULFILLED              = 'METADATA_SEARCH_FULFILLED';
export const METADATA_SEARCH_REJECTED               = 'METADATA_SEARCH_REJECTED';
// +
export const VOCABULARY_SEARCH                      = 'VOCABULARY_SEARCH';
export const VOCABULARY_SEARCH_PENDING              = 'VOCABULARY_SEARCH_PENDING';
export const VOCABULARY_SEARCH_FULFILLED            = 'VOCABULARY_SEARCH_FULFILLED';
export const VOCABULARY_SEARCH_REJECTED             = 'VOCABULARY_SEARCH_REJECTED';

// Metadata editing
export const INITIALIZE_LINKEDDATA_FORM             = 'INITIALIZE_LINKEDDATA_FORM';
export const ADD_LINKEDDATA_VALUE                   = 'ADD_LINKEDDATA_VALUE';
export const UPDATE_LINKEDDATA_VALUE                = 'UPDATE_LINKEDDATA_VALUE';
export const DELETE_LINKEDDATA_VALUE                = 'DELETE_LINKEDDATA_VALUE';
export const VALIDATE_LINKEDDATA_PROPERTY           = 'VALIDATE_LINKEDDATA_FORM';
