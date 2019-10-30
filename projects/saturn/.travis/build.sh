#!/bin/bash
set -e

$BUILD_SCRIPTS_DIR/gradle/tag.sh
./gradlew clean build test jacocoTestReport $GRADLE_OPTIONS

# Show the code coverage report on the command line
# First remove the 'io.fairspace.saturn' package prefix to simplify output
# After that, only select columns 2 - 7 (disregarding app name and line,
# complexity and method coverage)
# Finally, show the output as a table
echo "-- Code coverage --"
sed s/io.fairspace.saturn// ./build/reports/jacoco/test/jacocoTestReport.csv | \
   cut -d "," -f2-7 | \
   column -t -s,
echo

# Run vulnerability check on release to master
# It is configured in build.gradle to exit with non-zero status for
# CVSS scores >= 9 (i.e. critical)
if [[ "$TRAVIS_BRANCH" = "$RELEASE_BRANCH" ]]; then
  ./gradlew dependencyCheckAnalyze
fi

$BUILD_SCRIPTS_DIR/docker/build.sh
