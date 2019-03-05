import os
import tempfile

from tornado import web

from notebook.services.contents.largefilemanager import LargeFileManager


class AtomicLargeFileManager(LargeFileManager):
    """Handle large file upload atomically."""

    _temp_dir = tempfile.mkdtemp()

    def _get_os_path(self, path):
        return os.path.join(self._temp_dir, path)

    def run_post_save_hook(self, model, os_path):
        relative_path = os_path[len(self._temp_dir):]
        target_path = super()._get_os_path(relative_path)

        try:
            os.rename(os_path, target_path)
        except Exception as e:
            self.log.error("Error moving an uploaded file from %s to %s", os_path, target_path, exc_info=True)
            raise web.HTTPError(500, u'Unexpected error while moving an uploaded file to its destination: %s' % e)

        return super().run_post_save_hook(model=model, os_path=target_path)
