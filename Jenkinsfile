pipeline {
    agent {
      label "jenkins-gradle"
    }
    environment {
      ORG               = 'fairspace'
      APP_NAME          = 'workspace'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')
    }
    stages {
      stage('Build helm chart') {
        steps {
          dir ('./workspace') {
            container('gradle') {
              sh "make build"
            }
          }
        }
      }

      stage('Release helm chart') {
        when {
          branch 'master'
        }
        steps {
          dir ('./workspace') {
            container('gradle') {
              // Ensure the git command line tool has access to proper credentials
              sh "git config --global credential.helper store"
              sh "jx step validate --min-jx-version 1.1.73"
              sh "jx step git credentials"

              sh "make tag"
              sh "make release"
            }
          }
        }
      }
    }
    post {
      always {
        cleanWs()
      }
    }
}
