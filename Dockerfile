FROM jupyter/datascience-notebook:61d8aaedaeaf

USER root

RUN conda create -n py2 python=2 ipykernel -y
ENV OLD_PATH $PATH
ENV PATH /opt/conda/envs/py2/bin:$PATH
RUN python -m ipykernel install

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

RUN conda install --name py2 --quiet --yes \
    'conda-forge::blas=*=openblas' \
    'ipywidgets=7.2*' \
    'pandas=0.23*' \
    'numexpr=2.6*' \
    'matplotlib=2.2*' \
    'scipy=1.1*' \
    'seaborn=0.9*' \
    'scikit-learn=0.19*' \
    'scikit-image=0.14*' \
    'sympy=1.1*' \
    'cython=0.28*' \
    'patsy=0.5*' \
    'statsmodels=0.9*' \
    'cloudpickle=0.5*' \
    'dill=0.2*' \
    'numba=0.38*' \
    'bokeh=0.13*' \
    'sqlalchemy=1.2*' \
    'hdf5=1.10*' \
    'h5py=2.7*' \
    'vincent=0.4.*' \
    'beautifulsoup4=4.6.*' \
    'protobuf=3.*' \
    'xlrd'  && \
    conda clean -tipsy && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

ENV PATH $OLD_PATH

USER $NB_USER
RUN mkdir /home/jovyan/collections
