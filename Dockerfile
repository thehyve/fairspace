FROM jupyterhub/k8s-hub:0.7.0

USER root
ADD openid.py /usr/local/lib/python3.6/dist-packages/oauthenticator/

USER ${NB_USER}
