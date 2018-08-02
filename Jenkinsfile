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
              sh "helm upgrade --install --wait workspace-ci chartmuseum/workspace --namespace=workspace-ci -f ../ci/ci-values.yaml"
            }
          }
        }
      }
      stage('Trigger Janus e2e tests') {
        when {
          branch 'master'
        }
        steps {
          build job: '/Janus/master', wait: false, propagate: false
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
