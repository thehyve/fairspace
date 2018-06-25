# A Helm chart for VRE workspaces

Includes:
- JupyterHub with Python 3 and R kernels and JupyterLab extension
- Pluto
- Mercury

Configuration settings for specific applications should be put under a corresponding section in config.yaml:

```
jupyterhub:
   # jupyterhub-specific settings
pluto:
   # pluto-specific settings
mercury:
   # mercury-specific settings   
```   
