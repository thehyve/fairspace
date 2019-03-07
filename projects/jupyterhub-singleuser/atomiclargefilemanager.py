import shutil

from tempfile import NamedTemporaryFile
from tornado import web

from notebook.services.contents.filemanager import FileContentsManager
from notebook.services.contents.largefilemanager import LargeFileManager


class AtomicLargeFileManager(LargeFileManager):
    """Handles large file uploads atomically.
     The only difference with LargeFileManager is that it first saves a file to a temporary location
     and then copies it to the final destination.
     That makes partially uploaded files invisible to the user and fixes WebDAV integration issues
     """

    uploads = {}

    def _get_os_path(self, path):
        if path in self.uploads :
            return self.uploads[path]

        return super()._get_os_path(path)

    def save(self, model, path=''):
        """Save the file model and return the model with no content."""
        chunk = model.get('chunk', None)
        if chunk is not None:
            path = path.strip('/')

            if 'type' not in model:
                raise web.HTTPError(400, u'No file type provided')
            if model['type'] != 'file':
                raise web.HTTPError(400, u'File type "{}" is not supported for large file transfer'.format(model['type']))
            if 'content' not in model:
                raise web.HTTPError(400, u'No file content provided')

            try:
                if chunk == 1:
                    temp_file = NamedTemporaryFile(delete=False)
                    self.uploads[path] = temp_file.name
                    temp_file.close()

                    self.log.debug("Saving %s", path)
                    self.run_pre_save_hook(model=model, path=path)
                    super()._save_file(self.uploads[path], model['content'], model.get('format'))
                else:
                    self._save_large_file(self.uploads[path], model['content'], model.get('format'))

                model = self.get(path, content=False)

                # Last chunk
                if chunk == -1:
                    temp = self.uploads[path]
                    del self.uploads[path]
                    os_path = self._get_os_path(path)
                    shutil.move(temp, os_path)
                    self.run_post_save_hook(model=model, os_path=os_path)
            except web.HTTPError:
                del self.uploads[path]
                raise
            except Exception as e:
                del self.uploads[path]
                self.log.error(u'Error while saving file: %s %s', path, e, exc_info=True)
                raise web.HTTPError(500, u'Unexpected error while saving file: %s %s' % (path, e))

            return model
        else:
            return FileContentsManager.save(self, model, path)