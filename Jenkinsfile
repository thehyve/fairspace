@Library("hipchat") _

pipeline {
    agent {
      label "jenkins-javascript"
    }
    environment {
      ORG               = 'fairspace'
      APP_NAME          = 'workspace'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')
    }
    stages {
      stage('Run e2e tests') {
        when {
           branch 'master'
        }
        steps {
          dir ('./Janus') {
            container('javascript') {
              sh "git config --global credential.helper store"
              sh "jx step validate --min-jx-version 1.1.73"
              sh "jx step git credentials"

              sh "npm install cypress --save-dev"
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
