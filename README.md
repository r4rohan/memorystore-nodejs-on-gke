# memorystore-nodejs-on-gke
memorystore with nodejs on gke

### create gke cluster
gcloud container clusters create cloud-orbit-gke \
 --num-nodes 3 \
 --zone us-central1-c \
 --machine-type n1-standard-2 \
 --scopes “https://www.googleapis.com/auth/source.read_write,cloud-platform"
 
 ### connect gke
 gcloud container clusters get-credentials cloud-orbit-gke --zone us-central1-c --project cloudorbit
 
 ### create a memorystore instance
 gcloud redis instances describe cloud-orbit-redis-instance --region=us-central1-c
 
 Note: the redis instance region should be same as application region

### build and tag docker image
docker build -t gcr.io/{PROJECT_ID}/cloud-orbit-memorystore:1 -f Dockerfile .

### push to gcr.io
docker push gcr.io/{PROJECT_ID}/cloud-orbit-memorystore:1

### create namespace
kubectl create ns memorystore

### create configmap
kubectl -n memorystore apply -f gke-k8s-deployment/memorystore-configmap.yaml

### create pod deployment
kubectl -n memorystore apply -f gke-k8s-deployment/cloud-orbit-memorystore.yaml

kubectl -n memorystore get pods

kubectl get svc
### to hit the loadbalancerIP

### to get pod description
kubectl -n memorystore describe pods [pod_name]

### to get logs of pod
kubectl logs [pod_name]
