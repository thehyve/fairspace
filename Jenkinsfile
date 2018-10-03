@Library("hipchat") _

pipeline {
    agent {
      label "jenkins-gradle"
    }
    environment {
      JENKINS_CONTAINER_TAG = 'gradle'
      ORG               = 'fairspace'
      APP_NAME          = 'jupyterhub-hub'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')

      DOCKER_TAG_PREFIX = "$DOCKER_REPO/$ORG/$APP_NAME"
      VERSION           = "0.1.${env.BUILD_NUMBER}"
    }
    stages {
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
            sh "docker build . --tag \$DOCKER_TAG_PREFIX:\$VERSION --tag \$DOCKER_TAG_PREFIX:latest && docker push \$DOCKER_TAG_PREFIX:\$VERSION && docker push \$DOCKER_TAG_PREFIX:latest"
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
      failure {
        script {
          hipchat.notifyFailure()
        }
      }
    }
}
