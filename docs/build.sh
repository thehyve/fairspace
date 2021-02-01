#!/usr/bin/env bash

PROJECT_FILES=(
  "projects/saturn/src/main/resources/system-vocabulary.ttl"
  "projects/saturn/taxonomies.ttl"
  "projects/saturn/views.yaml"
  "projects/saturn/vocabulary.ttl"
)


here=$(dirname "${0}")
pushd "${here}"

mkdir -p build/docs
cp -r images build/docs/
for f in ${PROJECT_FILES[*]}; do
  mkdir -p "build/$(dirname "$f")"
  cp "../$f" "build/"$(dirname "$f")""
done
asciidoctor-pdf -o build/Fairspace.pdf ../README.adoc || {
  echo "Error building PDF"
  popd
  exit 1
}
asciidoctor -a toc=left -D build/ -o index.html ../README.adoc || {
  echo "Error building site"
  popd
  exit 1
}

popd
