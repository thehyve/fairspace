FROM jupyter/scipy-notebook:d4cbf2f80a2a

USER root

RUN echo 'deb http://archive.ubuntu.com/ubuntu/ bionic-proposed restricted main multiverse universe' >> /etc/apt/sources.list.d/proposed-repositories.list
RUN apt-get update
RUN apt-get install -y vim net-tools nginx davfs2

EXPOSE 80

RUN echo "$NB_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx" >> /etc/sudoers

ADD start /
RUN chmod a+rx /start

ADD atomiclargefilemanager.py /opt/conda/lib/python3.7/site-packages/notebook/services/contents/
RUN echo "" >> /etc/jupyter/jupyter_notebook_config.py
RUN echo "from notebook.services.contents.atomiclargefilemanager import AtomicLargeFileManager" >> /etc/jupyter/jupyter_notebook_config.py
RUN echo "c.NotebookApp.contents_manager_class = AtomicLargeFileManager" >> /etc/jupyter/jupyter_notebook_config.py
RUN echo "c.FileCheckpoints.checkpoint_dir = '/home/jovyan/.notebookCheckpoints'" >> /etc/jupyter/jupyter_notebook_config.py

RUN chmod u+s /sbin/mount.davfs
RUN echo 'http://localhost/webdav/v1/ /home/jovyan/collections davfs user,noauto,file_mode=600,dir_mode=700 0 1' >> /etc/fstab
RUN usermod -a -G davfs2 jovyan

