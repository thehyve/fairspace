# A Helm chart for VRE workspaces

Includes:
- JupyterHub with Python 3 and R kernels and JupyterLab extension
- Mercury


### To create a configuraion file and perform initial setup:

`./config.sh`

### Adjust configuration:

`vi <workspace-name>-config.yaml`

Configuration settings for specific applications should be put under a corresponding section in config.yaml:

`jupyterhub:`  # jupyterhub-specific settings, see [http://zero-to-jupyterhub.readthedocs.io/en/latest/user-environment.html]
`mercury:`     # mercury-specific settings, see [https://github.com/fairspace/mercury/blob/master/README.md]   
 

### To install:

`./install.sh`
