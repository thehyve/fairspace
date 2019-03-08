import os
import shutil

from tempfile import NamedTemporaryFile

from notebook.services.contents.largefilemanager import LargeFileManager


class AtomicLargeFileManager(LargeFileManager):
    """Handles large file uploads atomically.
     The only difference with LargeFileManager is that it first saves a file to a temporary location
     and then copies it to the final destination.
     That makes partially uploaded files invisible to the user and fixes WebDAV integration issues
     """

    # target path to temporary path
    _active_uploads = {}

    def _get_os_path(self, path):
        path = path.strip('/')
        if path in self._active_uploads:
            return self._active_uploads[path]

        return super()._get_os_path(path)

    def save(self, model, path=''):
        if 'chunk' in model:
            path = path.strip('/')
            if path not in self._active_uploads:
                temp_file = NamedTemporaryFile(delete=False)
                self._active_uploads[path] = temp_file.name
                temp_file.close()

        try:
            return super().save(model, path)
        except Exception:
            if path in self._active_uploads:
                os.remove(self._active_uploads[path])
                del self._active_uploads[path]
            raise

    def run_post_save_hook(self, model, os_path):
        path = model['path'].strip('/')
        if path in self._active_uploads:
            temp = self._active_uploads[path]
            del self._active_uploads[path]
            os_path = self._get_os_path(path)
            shutil.move(temp, os_path)

        return super().run_post_save_hook(model, os_path)
