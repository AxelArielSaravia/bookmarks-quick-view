#! /bin/bash

#This Build use:
# Bun.js to bundle and minify javascript (https://bun.sh/)
# tdewolff/minify to minify html, css and json (https://github.com/tdewolff/minify)

if [[ ! -d "./extension" ]]; then
    mkdir ./extension
fi

if [[ ! -d "./extension/images" ]]; then
    cp -dr ./src/images ./extension
fi

bun build ./src/main.js --outdir ./extension --minify-whitespace --minify-syntax
if [[ $? == 0 ]]; then
    echo JS build and minify
fi

minify -o ./extension/index.html ./src/index.html
if [[ $? == 0 ]]; then
    echo index.html minified success
fi

minify -o ./extension/style.css ./src/style.css
if [[ $? == 0 ]]; then
    echo index.css minified success
fi

minify -o ./extension/manifest.json ./src/manifest.json
if [[ $? == 0 ]]; then
    echo manifest.json minified success
fi