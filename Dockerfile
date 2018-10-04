FROM jupyterhub/k8s-hub:0.7.0

ADD openid.py /usr/local/lib/python3.6/dist-packages/oauthenticator/

