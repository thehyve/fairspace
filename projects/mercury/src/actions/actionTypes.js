/* eslint-disable no-multi-spaces */

// Account
export const FETCH_USER                             = 'FETCH_USER';
export const FETCH_USERS                            = 'FETCH_USERS';
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
export const FETCH_FILES                            = 'FETCH_FILES';
export const FETCH_FILES_PENDING                    = 'FETCH_FILES_PENDING';
export const FETCH_FILES_FULFILLED                  = 'FETCH_FILES_FULFILLED';
export const FETCH_FILES_REJECTED                   = 'FETCH_FILES_REJECTED';
export const INVALIDATE_FETCH_FILES                 = 'INVALIDATE_FETCH_FILES';
export const RENAME_FILE                            = 'RENAME_FILE';
export const RENAME_FILE_FULFILLED                  = 'RENAME_FILE_FULFILLED';
export const DELETE_FILE                            = 'DELETE_FILE';
export const DELETE_FILE_FULFILLED                  = 'DELETE_FILE_FULFILLED';
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
export const UPDATE_METADATA_FULFILLED              = 'UPDATE_METADATA_FULFILLED';
export const COMBINE_METADATA                       = 'COMBINE_METADATA';
export const FETCH_METADATA_VOCABULARY              = 'FETCH_METADATA_VOCABULARY';
export const FETCH_METADATA_ENTITIES                = 'FETCH_METADATA_ENTITIES';
export const FETCH_ALL_METADATA_ENTITIES            = 'FETCH_ALL_METADATA_ENTITIES';
export const CREATE_METADATA_ENTITY                 = 'CREATE_METADATA_ENTITY';
export const CREATE_METADATA_ENTITY_PENDING         = 'CREATE_METADATA_ENTITY_PENDING';
export const CREATE_METADATA_ENTITY_FULFILLED       = 'CREATE_METADATA_ENTITY_FULFILLED';
export const CREATE_METADATA_ENTITY_REJECTED        = 'CREATE_METADATA_ENTITY_REJECTED';

// Permissions
export const FETCH_PERMISSIONS                      = 'FETCH_PERMISSIONS';
export const ALTER_PERMISSION                       = 'ALTER_PERMISSION';
export const ALTER_PERMISSION_PENDING               = 'ALTER_PERMISSION_PENDING';
export const ALTER_PERMISSION_FULFILLED             = 'ALTER_PERMISSION_FULFILLED';
export const ALTER_PERMISSION_REJECTED              = 'ALTER_PERMISSION_REJECTED';

// Workspace
export const FETCH_WORKSPACE                        = 'FETCH_WORKSPACE';

// UI
export const TOGGLE_MENU                            = 'TOGGLE_MENU';
export const MOUSE_ENTER_MENU                       = 'MOUSE_ENTER_MENU';
export const MOUSE_LEAVE_MENU                       = 'MOUSE_LEAVE_MENU';

// Search
export const PERFORM_SEARCH                         = 'PERFORM_SEARCH';
export const PERFORM_SEARCH_PENDING                 = 'PERFORM_SEARCH_PENDING';
export const PERFORM_SEARCH_FULFILLED               = 'PERFORM_SEARCH_FULFILLED';
export const PERFORM_SEARCH_REJECTED                = 'PERFORM_SEARCH_REJECTED';
