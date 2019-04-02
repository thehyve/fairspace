import os
import shutil
from notebook.services.contents.largefilemanager import LargeFileManager
from os import makedirs
from os.path import expanduser
from uuid import uuid4


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
                self._active_uploads[path] = self._temp_file()

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

    def _temp_file(self):
        temp_dir = expanduser('~/.partial_uploads/')
        makedirs(temp_dir, exist_ok=True)
        return temp_dir + str(uuid4())
