pipeline {
    agent {
      label "jenkins-gradle"
    }
    environment {
      ORG               = 'fairspace'
      APP_NAME          = 'pluto'
      DOCKER_REPO       = 'docker-registry.jx.test.fairdev.app'

      CHARTMUSEUM_CREDS = credentials('jenkins-x-chartmuseum')
      DOCKER_REPO_CREDS = credentials('jenkins-x-docker-repo')

      DOCKER_TAG_PREFIX = '$DOCKER_REPO/$ORG/$APP_NAME'
    }
    stages {
      stage('Build application') {
        steps {
          container('gradle') {
            sh "gradle clean build test"
          }
        }
      }
      stage('Build docker image') {
        steps {
          container('gradle') {
            sh "docker build ."
          }
        }
      }
      stage('Release docker image') {
        when {
          branch 'master'
        }
        steps {
          container('gradle') {
            sh "echo \$(jx-release-version) > VERSION"
            sh "export VERSION=`cat VERSION` && docker build . --tag \$DOCKER_TAG_PREFIX:\$VERSION && docker push \$DOCKER_TAG_PREFIX:\$VERSION"
          }
        }
      }

      stage('Build helm chart') {
        steps {
          dir ('./charts/pluto') {
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
          dir ('./charts/pluto') {
            container('gradle') {
              sh "make tag"
              sh "make release"
            }
          }
        }
      }
    }
    post {
      always {
        junit 'app/build/test-results/**/*.xml'
        cleanWs()
      }
    }
}
