from notebook.services.contents.atomiclargefilemanager import AtomicLargeFileManager

c.NotebookApp.contents_manager_class = AtomicLargeFileManager
c.FileCheckpoints.checkpoint_dir = '/home/jovyan/.notebookCheckpoints'