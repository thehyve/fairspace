@Library("hipchat") _

pipeline {
    agent {
      label "jenkins-nodejs"
    }
    environment {
      JENKINS_CONTAINER_TAG = 'nodejs'
      ORG               = 'fairspace'
      APP_NAME          = 'Janus'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')
    }
    stages {
      stage('Run e2e tests') {
        steps {
          dir ('./Janus') {
            container(JENKINS_CONTAINER_TAG) {
              sh "npm install cypress"
              sh "ls"
              sh "pwd"
              sh "find / -name cypress"
              sh "./node_modules/.bin/cypress run --record"
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
