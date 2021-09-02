#!/usr/bin/env bash

PROJECT_FILES=(
  "projects/saturn/src/main/resources/log4j2.properties"
  "projects/saturn/src/main/resources/system-vocabulary.ttl"
  "projects/saturn/taxonomies.ttl"
  "projects/saturn/views.yaml"
  "projects/saturn/vocabulary.ttl"
)


here=$(dirname "${0}")
pushd "${here}"
version=$(cat ../VERSION)
mkdir -p build/docs
cp ../README.adoc build/
sed -i -e "s/VERSION/${version}/" build/README.adoc
cp -r images build/docs/
for f in ${PROJECT_FILES[*]}; do
  mkdir -p "build/$(dirname "$f")"
  cp "../$f" "build/"$(dirname "$f")""
done
asciidoctor-pdf -a pdf-theme=pdf-theme.yml -o build/Fairspace.pdf build/README.adoc || {
  echo "Error building PDF"
  popd
  exit 1
}
asciidoctor -a toc=left -D build/ -o index.html build/README.adoc || {
  echo "Error building site"
  popd
  exit 1
}
rm build/README.adoc
popd
