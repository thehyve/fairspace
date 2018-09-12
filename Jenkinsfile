@Library("hipchat") _

pipeline {
    agent {
      label "jenkins-gradle"
    }
    environment {
      JENKINS_CONTAINER_TAG = 'gradle'
      ORG               = 'fairspace'
      APP_NAME          = 'pluto'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      NEXUS_CREDENTIALS = credentials('jenkins-x-nexus')

      VERSION           = "0.1.${env.BUILD_NUMBER}"
    }
    stages {
      stage('Build application') {
        steps {
          container(JENKINS_CONTAINER_TAG) {
            sh "gradle clean build test"
          }
        }
      }
      stage('Release to nexus') {
        steps {
          container(JENKINS_CONTAINER_TAG) {
            sh "gradle publish"
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
