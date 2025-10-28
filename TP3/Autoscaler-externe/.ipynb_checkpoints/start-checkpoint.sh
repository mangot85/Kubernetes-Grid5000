#!/bin/bash

echo "=== Installation ==="

# Fonction utilitaire pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Étape 1 : Docker
echo ">> Vérification de Docker..."
if ! command_exists docker; then
    echo "Docker non trouvé. Installation..."
    g5k-setup-docker -t
    echo "[OK] Docker installé"
else
    echo "[OK] Docker déjà installé"
fi

# Étape 2 : Minikube
echo ">> Vérification de Minikube..."
if ! command_exists minikube; then
    echo "Minikube non trouvé. Téléchargement et installation..."
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    rm minikube-linux-amd64
    echo "[OK] Minikube installé"
else
    echo "[OK] Minikube déjà installé"
fi

echo ">> Démarrage de Minikube..."
minikube status >/dev/null 2>&1 || minikube start

echo ">> Vérification du statut de Minikube..."
minikube status

# Étape 3 : Kubectl
echo ">> Vérification de kubectl..."
if ! command_exists kubectl; then
    echo "kubectl non trouvé. Installation..."
    sudo-g5k apt-get install -y apt-transport-https ca-certificates curl gnupg
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo-g5k gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    sudo-g5k chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo-g5k tee /etc/apt/sources.list.d/kubernetes.list
    sudo-g5k chmod 644 /etc/apt/sources.list.d/kubernetes.list
    sudo-g5k apt-get update
    sudo-g5k apt-get install -y kubectl
else
    echo "[OK] kubectl déjà installé"
fi

echo ">> Vérification des pods Kubernetes..."
kubectl get pods -A || {
    echo "[ERREUR] kubectl ne peut pas accéder au cluster. Vérifiez la configuration de votre cluster Minikube."
    exit 1
}

echo "Kubernetes prêt !"

# Étape 4 : Node.js
echo ">> Vérification de Node.js..."
if ! command_exists node; then
    echo "Node.js non trouvé. Installation..."
    sudo-g5k apt-get install -y snapd
    sudo-g5k snap install --classic code
    sudo-g5k apt-get install -y npm
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo-g5k -E bash -
    sudo-g5k apt-get install -y nodejs
else
    echo "[OK] Node.js déjà installé"
fi

echo "Node version: $(node -v)"
echo "✅ Installation terminée avec succès."

# Scripts

cleanup() {
    echo "arret des scripts"
    kill $PID1 $PID2 2>/dev/null
    wait $PID1 $PID2 2>/dev/null
    echo "scripts coupés"
    exit
}

kubectl apply -f k8-tp-03-busy-box-deployment.yaml
kubectl apply -f k8-tp-03-busy-box-service.yaml

trap cleanup SIGINT SIGTERM

node main-auto-scaler.js &
PID1=$!
echo "Auto scaler lancé avec PID $PID1"

node main-load-generator.js &
PID2=$!
echo "Generator lancé avec PID $PID2"


