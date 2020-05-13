# Memorystore-Nodejs-on-GKE
Google Memorystore with Nodejs on Google Kubernetes Engine
This repo is for the medium blogs on Google Memorystore with Nodejs on Google Kubernetes Engine. Read it here: https://medium.com/faun/google-cloud-memorystore-with-node-js-on-google-kubernetes-engine-c9aa13721268

### create gke cluster
gcloud container clusters create cloud-orbit-gke \
 --num-nodes 3 \
 --zone us-central1-c \
 --machine-type n1-standard-2 \
 --scopes "https://www.googleapis.com/auth/source.read_write,cloud-platform"
 
### connect gke
gcloud container clusters get-credentials cloud-orbit-gke --zone us-central1-c --project cloudorbit
 
### create a memorystore instance
gcloud redis instances create INSTANCE_ID --size=1 --region=us-central1 --project=SERVICE_PROJECT_ID \
    --network=projects/cloudorbit/global/networks/default \
    --connect-mode=private-service-access
    
gcloud redis instances describe INSTANCE_ID --region=us-central1
 

### build and tag docker image
docker build -t gcr.io/{PROJECT_ID}/cloud-orbit-memorystore:1 -f Dockerfile .

### push to gcr.io
docker push gcr.io/{PROJECT_ID}/cloud-orbit-memorystore:1

### create namespace
kubectl create ns redis

### create configmap
export REDISHOST_IP=[host-ip-of-instance] 
kubectl -n redis create configmap ms-cm --from-literal=REDISHOST=${REDISHOST_IP}
kubectl -n redis get configmaps -o yaml

### create pod deployment
kubectl -n redis apply -f gke-k8s-deployment/cloud-orbit-memorystore.yaml

kubectl -n redis get pods

kubectl -n redis get svc
**hit the loadbalancerIP from service**
curl http://[External-loadbalancer-ip]

### to get pod description
kubectl -n redis describe pods [pod_name]

### to get logs of pod
kubectl -n redis logs [pod_name]

### other way to check memorystore is working or not
if the user is new then it will show true else false
for user 1:<br>
http://[External-loadbalancer-ip]/api/user/1<br>
**Output**
{"value":80,"isNew":true}<br>

if the number is not new it will give false<br>
for user 1:<br>
http://[External-loadbalancer-ip]/api/user/1<br>
**Output**
{"value":80,"isNew":false}<br>

### Pokemon API for testing
Inspect element, hit below url and check message and time first time, for the first time the message would be API.
http://[External-loadbalancer-ip]/type/1/

again hit and check message and time second time, for the second time the message would be REDIS and finish time is much lesser than earlier one.
