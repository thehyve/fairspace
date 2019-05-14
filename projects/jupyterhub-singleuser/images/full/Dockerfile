FROM eu.gcr.io/fairspace-207108/jupyterhub-singleuser-base:0.3.2

USER root

# wdfs
RUN echo 'deb http://archive.ubuntu.com/ubuntu/ bionic-proposed restricted main multiverse universe' >> /etc/apt/sources.list.d/proposed-repositories.list
RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get install -y -t bionic-proposed libneon27 libneon27-dev
RUN apt-get install -y git autoconf automake checkinstall libfuse-dev python-fuse pkg-config vim net-tools nginx

RUN wget http://noedler.de/projekte/wdfs/wdfs-1.4.2.tar.gz
RUN tar xfz wdfs-1.4.2.tar.gz
WORKDIR wdfs-1.4.2
RUN ./configure && make && make install
WORKDIR ..
RUN rm -rf wdfs-1.4.2
RUN rm -rf wdfs-1.4.2.tar.gz

EXPOSE 80

RUN echo "$NB_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx" >> /etc/sudoers

ADD start /
RUN chmod a+rx /start

ADD atomiclargefilemanager.py /opt/conda/lib/python3.6/site-packages/notebook/services/contents/
RUN echo "" >> /etc/jupyter/jupyter_notebook_config.py
RUN echo "from notebook.services.contents.atomiclargefilemanager import AtomicLargeFileManager" >> /etc/jupyter/jupyter_notebook_config.py
RUN echo "c.NotebookApp.contents_manager_class = AtomicLargeFileManager" >> /etc/jupyter/jupyter_notebook_config.py

USER $NB_USER
RUN mkdir /home/jovyan/collections
