FROM jupyter/scipy-notebook:a6fc0cfbd01b

USER root

RUN conda create -n py2 python=2 ipykernel -y
ENV OLD_PATH $PATH
ENV PATH /opt/conda/envs/py2/bin:$PATH
RUN python -m ipykernel install
ENV PATH $OLD_PATH


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
    conda clean -tipsy

# R packages including IRKernel which gets installed globally.
RUN conda install --quiet --yes \
    'rpy2=2.8*' \
    'r-base=3.4.1' \
    'r-irkernel=0.8*' \
    'r-plyr=1.8*' \
    'r-devtools=1.13*' \
    'r-tidyverse=1.1*' \
    'r-shiny=1.0*' \
    'r-rmarkdown=1.8*' \
    'r-forecast=8.2*' \
    'r-rsqlite=2.0*' \
    'r-reshape2=1.4*' \
    'r-nycflights13=0.2*' \
    'r-caret=6.0*' \
    'r-rcurl=1.95*' \
    'r-crayon=1.3*' \
    'r-randomforest=4.6*' \
    'r-htmltools=0.3*' \
    'r-sparklyr=0.7*' \
    'r-htmlwidgets=1.0*' \
    'r-hexbin=1.27*'


RUN conda clean -tipsy && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# wdfs
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
