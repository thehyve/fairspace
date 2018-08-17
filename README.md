# Triton File Server

## To start

```
npm install
npm start
```

## API

- a path is either a directory a path or a file path. API prefix (/file/) is not a part of a path 
- directory paths always end with a slash /
- file paths don't end with a slash

| URL                                      | Action                                  |
| ---------------------------------------- | --------------------------------------- |
| GET /files/_directory_path_              | List of files in the directory          |
| GET /files/_file_path_                   | Downloads a file                        |
| PUT /files/_directory_path_              | Creates a directory                     |
| PUT /files/_file_path_                   | Creates or overwrites a file            |
| POST /files/_file_path_                  | Uploads files via multipart/form-data   |
| DELETE /files/_path_                     | Deletes a file or a directory           |
| PATCH  /files?from=_path_&to=_path_      | Moves a file or directory               |
| PATCH  /files?copy&from=_path_&to=_path_ | Copies a file or directory              |

### File list format

```$json
[
  {
    "name": "dir",
    "directory": true,
    "size": 4096,
    "modified": "2018-08-15T14:46:47.651Z"
  },
  {
    "name": "ubuntu-18.04-live-server-amd64.iso",
    "directory": false,
    "size": 845152256,
    "modified": "2018-08-15T16:29:45.945Z"
  }
]
```

## Helm chart documentation

It's [**here**](charts/triton/README.md) 
