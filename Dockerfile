FROM jupyter/datascience-notebook:61d8aaedaeaf

USER root

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python2 get-pip.py
RUN python2 -m pip install ipykernel
RUN python2 -m ipykernel install

RUN apt-get update
RUN apt-get install -y apt-utils
RUN apt-get install -y git autoconf automake checkinstall libfuse-dev libneon27 libneon27-dev python-fuse pkg-config vim net-tools nginx

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

USER $NB_USER
RUN mkdir /home/jovyan/collections
