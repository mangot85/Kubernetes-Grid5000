#!/bin/bash

echo "=== Installation ==="

# Étape 1 : Docker
echo ">> Installation de Docker..."

if ! docker info; then
    g5k-setup-docker -t
    echo "[OK] Docker installé"
else
    echo "[OK] Docker fonctionne"
fi



if ! minikube status; then
    echo ">> Téléchargement et installation de Minikube..."
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
fi

echo ">> Démarrage de Minikube..."
minikube start

echo ">> Vérification du statut de Minikube..."
minikube status

# Étape 3 : Installation de Kubectl
echo ">> Installation de kubectl..."

sudo-g5k apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo-g5k gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo-g5k chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo-g5k tee /etc/apt/sources.list.d/kubernetes.list
sudo-g5k chmod 644 /etc/apt/sources.list.d/kubernetes.list
sudo-g5k apt-get update
sudo-g5k apt-get install -y kubectl


echo ">> Vérification des pods Kubernetes après installation de kubectl..."
kubectl get pods -A || {
    echo "[ERREUR] kubectl ne peut pas accéder au cluster. Vérifiez la configuration de votre cluster Minikube."
    exit 1
}

echo "Kubernetes installé !"

echo ">> Installation de Node"
sudo-g5k apt-get install snapd
sudo-g5k snap install --classic code
sudo-g5k apt-get install -y npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo-g5k -E bash -
sudo-g5k apt-get install -y nodejs
node -v


echo "✅ Installation terminée avec succès."
