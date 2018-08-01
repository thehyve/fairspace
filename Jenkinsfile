@Library("hipchat") _

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

      stage('Deploy on CI') {
        when {
          branch 'master'
        }
        steps {
          dir ('./workspace') {
            container('gradle') {
              sh "helm repo add chartmuseum https://chartmuseum.jx.test.fairdev.app/"
              sh "helm repo update"
              sh "helm upgrade --install workspace-ci chartmuseum/workspace --namespace=workspace-ci -f ../ci/ci-values.yaml"
            }
          }
        }
      }
      stage('Run e2e tests') {
        when {
           branch 'master'
        }
        steps {
          dir ('./workspace') {
            container('gradle') {
              sh "apt-get install xvfb libgtk2.0-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 npm"
              sh "npm install cypress --save-dev"
              sh "git clone https://github.com/fairspace/Janus.git"
              sh "cd Janus"
              sh "cypress run --record"
            }
          }
        }
      }
      stage('Hipchat notification') {
        when {
          branch 'master'
        }
        steps {
          script {
            hipchat.notifySuccess()
          }
        }
      }
    }
    post {
      failure {
        script {
          hipchat.notifyFailure()
        }
      }
      cleanup {
        cleanWs()
      }
    }
}
