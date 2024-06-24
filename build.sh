#!/bin/bash

npm run build

docker buildx build --platform linux/arm64  -t ferlzc/demo-webgl-emb24 -f Dockerfile.nginx .

docker push ferlzc/demo-webgl-emb24
