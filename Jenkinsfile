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

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')

      DOCKER_TAG_PREFIX = "$DOCKER_REPO/$ORG/$APP_NAME"
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
      stage('Build docker image') {
        steps {
          container(JENKINS_CONTAINER_TAG) {
            sh "docker build ."
          }
        }
      }
      stage('Release docker image') {
        when {
          branch 'master'
        }
        steps {
          container(JENKINS_CONTAINER_TAG) {
            sh "echo $VERSION > VERSION"
            sh "docker build . --tag \$DOCKER_TAG_PREFIX:\$VERSION && docker push \$DOCKER_TAG_PREFIX:\$VERSION"
          }
        }
      }

      stage('Build helm chart') {
        steps {
          dir ("./charts/$APP_NAME") {
            container(JENKINS_CONTAINER_TAG) {
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
          dir ("./charts/$APP_NAME") {
            container(JENKINS_CONTAINER_TAG) {
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
      stage('Trigger workspace deploy') {
        when {
          branch 'master'
        }
        steps {
          build job: '/workspace/master', wait: false, propagate: false
        }
      }
    }
    post {
      always {
        junit 'app/build/test-results/**/*.xml'
      }
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
