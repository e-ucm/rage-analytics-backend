#!/bin/bash

set -o errexit -o nounset

cd ./public/apidoc
git init
git config user.name "${GIT_NAME}"
git config user.email "${GIT_EMAIL}"
git add .
git commit -m "Automatic deploy to GitHub Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1