#!/bin/bash

echo "=== Deploiement et Profilage ==="

kubectl delete --all services
kubectl delete --all deployments
kubectl delete --all pods

kubectl create -f k8-tp-04-busy-box-deployment.yaml
kubectl create -f k8-tp-04-busy-box-service.yaml

DIR_PROFILES="collected-profiles"

if [ -d $DIR_PROFILES ]; then
    rm -rf $DIR_PROFILES
fi

mkdir $DIR_PROFILES


node main-load-generator.js &
NODE_PID=$!

echo "Node lancé avec PID $NODE_PID"

chmod +x ./main-load-profiler.sh
./main-load-profiler.sh

echo "Arrêt de Load Generator"
kill $NODE_PID
echo "Node arrêté."

H=$(hostname)
H=${H%%.*} # On veut uniquement le nom de la machine
DIR_NAME="$DIR_PROFILES-$H"


if [ -d $DIR_NAME ]; then
    rm -rf $DIR_NAME
fi

mv "$DIR_PROFILES" "$DIR_NAME"

