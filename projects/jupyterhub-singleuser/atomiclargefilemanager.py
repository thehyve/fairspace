import os
import shutil
import tempfile

from tornado import web

from notebook.services.contents.largefilemanager import LargeFileManager


class AtomicLargeFileManager(LargeFileManager):
    """Handle large file upload atomically."""

    _temp_dir = tempfile.mkdtemp()
    _uploading = False

    def _get_os_path(self, path):
        if self._uploading:
            return os.path.join(self._temp_dir, os.path.basename(path))
        else:
            return super()._get_os_path(path)

    def run_post_save_hook(self, model, os_path):
        target_path = super()._get_os_path(model['path'])

        try:
            shutil.move(os_path, target_path)
        except Exception as e:
            self.log.error("Error moving an uploaded file from %s to %s", os_path, target_path, exc_info=True)
            raise web.HTTPError(500, u'Unexpected error while moving an uploaded file to its destination: %s' % e)

        return super().run_post_save_hook(model=model, os_path=target_path)

    def new(self, model=None, path=''):
        try:
            self._uploading = True
            return super().new(model, path)
        finally:
            self._uploading = False

