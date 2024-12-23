
```
> Node are simple VM(EC2), inside nodes we have pods, inside pods we have containers, those containers running on top of docker images.
> Cluster is a set of nodes together.

two type of servers:
	master, worker

Master Node: watches over the nodes in cluster and responsible for actual orch container on the worker nodes,
 
Kubernetes Components:	API server, etcd, kubelet, container runtime, controller, scheduler.
	API Server: acts as froentend for k8'scheduler(Users, managment devices, CLI, > talk to the api server to intract with k8's clusters).
	
	etcd: is a key store, a distributed reliable key store used by kubernetes to store all data used to manage the cluster.
		ex: in a cluster we have multiple nodes and multiple master, it stores all that info on all the nodes in the cluster in distributed manner.
		responsible for implement locks within the cluster to ensure that there no conflit b/w the masters.
		
	Scheduler: responsible for distributing work or containers across multiple node, looks for newly created containers and assign them to nodes.
	
	Controllers: Brain behind the orch, responsible for noticing and responding when nodes, containers or end points goes down.
		make decision to bring up the new containers.
	
	Container Runtime: is the underlying software that is used to run containers(Docker).
	
	Kubelet: is the agent that runs on each node in the cluster, responsible for making sure that the containers are running on the nodes as expected.
	=====
	"Kubectl": Kube cmd tool/kuberctl/kube control/
			Used to deploy and manage application on a kubernetes cluster. 
			To get cluster info, to get status of other nodes in a cluster, and manage many other things.
	::CMD::
		kubectl run <> ==> to deploy an application on the cluster.
		kubectl cluster-info ==> used to view information about cluster
		kubectl get nodes ==> to list all the nodes part of cluster

:::Master vs Worker:::
	Master has Kube API Server, and that is what makes it a master,
	etcd: All info gather are store in key value pair on the master
	controller, scheduler, are also part of master

	Containers are hosted on worker, to run containers we need container run time installed and that's where the container falls, >> (Docker)
		alternatives: Rocker or Cryo
	Worker node have the kubelet agent that is responsible for intracting with master to provide health info worker node, carry out actions req by master.
	

==============================
options avaliable to build a kubernetes cluster:
	1. minikube, microK8s, Kubeadm ==> developer or learner choice,
	
		Kubeadm tool used to bootstrap and manage production-grade kubernetes clusters.
		
		Minikube bundles all of the diff comp(API Server, etcd, scheduler, controller, kubelet, container runtime) into a single image(ISO Image)
		provide us a pre-config single node kubernetes cluster.
		(Single node kubernetes cluster)
		to work minikube smoothly, 
			1. Hypervisor, 2. kubectl utility, 3. minikube 
		
	2. Hosted Solutions:
		GCP, AWS, Azure, IBM, 
===============================
:::PODS:::
Our ultimate aim is to deploy our application in the form of container on a set of machines that are configured as worker nodes in a cluster,
	kubernetes doesn't directly deploy containers in the worker nodes.
	Containers Encapsulated into a Kubernetes onjects know as PODS. Pod is a single instance of an application.
	Pod > Smallest object that can create in k8s.
	(New pod, new instance, new application container) 'single pod doesn't support multiple containers of same kind'.
	1:1 with pod and container, pod contains multiple container(App, helper container) but not allowed of same type(app, app).
	two containers in pods also directly communicate with each other because it is in same pod(i.e., same n/w) and share volumes as well.
	
	YAML files as inputs for the creation of objects such as pods, Replicasets, deployment, servies ...
	Top level(root level)(req) fields:
		API version, Kind, Metadata, spec,
	kubectl create -f <yaml_file>
	kubectl apply -f <yaml_file>
	kubectl get pods
	kubectl describe pod <pod_name>
===============================
:::Replication Controllers and Replicasets:::
	
Controllers: Brain behind the orch, processes that monitor k8 obj and respond.
what is replica and why need of replication controller?
	if one fails, user doesn't face bad exp, so replicas needed, 
	replications controller:
		helps us run "multiple instances of single pod" in "k8 cluster", >> high avaliability
		it ensure that specified no of pods are running at all times, even if it's just one or a hundred.
		create multiple pods to share the load accress them (load balancer and scaling)
		ex: let's take single pod serving a set of users, when user increase, we deploy additional pod to balance the load across two pods.
		if the demand futher increase, and if we were to run out of resources on the first node, we could deploy additional pods across the other nodes in the cluster.
		replication controller spans accorss multiple nodes in the cluster, it helps us balance the load accorss multiple pods on diff nodes
		as well as scale our application when the demand increases.
			
Replication controller VS replica set:
Same purpose but not same:)

(Rep controller)old techonology replace by replica set(Added some more features).

How to write Rep controller file?
as discured earlier, Mainly 4 blocks: apiVersion, kind: ReplicationController, metadata, spec 
spec is most inportant
main task is to create multiple instance of pod, but what pod? so create a template section under spec to provide a pod details.
now ho many replicas, so add one more section in the spec as "replicas" to define no of replicas 

How to write Replicasets file?
as discured earlier, Mainly 4 blocks: 
apiVersion: apps/v1, 
kind: replicaset, 
metadata, 
spec 
almost all same, but one new thing added in spec i.e., "selector"
	selector sections helps the replica set identify what pods fall under it.
	but why?
	because replicaset can also manage pods that were not created as part of the replicaset creation, by using labels
by using labels replicaset comes to those are the pod i need to take care(monitor) whenever it fails, will spin-up a new pod.

replicaset scale or update?

do changes and then kubectl replace -f <yaml_file>
or else
kubectl scale --replicas=10 -f replicaset
or else
kubectl sclae --replicas=10 replicaset(type) myap-replicaset(name)
===============================
:::Deployment:::
	deploy in instances we have to take of few things below
	
	what if new version arrived? we need rolling update (one-after other), 
	what if their is error i new version, we have to undo (rollback), 
	what if have to multiple chages to the env?(web server version, as well as scaling env, modify the resource allocations ...)
	we don't want to apply each achanges immediately after the cmd run, instead we would like to apply a pause to our env make the changes and then resume so that 
	all the changes are rolled out together.
	
All these capabilities are avaliable with the k8 deployments.
	
Deep dive into update and rollback :
rollout and versioning in a deployment>> 
when you first create a deployment, it triggers a rollout, 
new rollout creates a new deploymant revision, in furture when app is upgrader, meaning when the container version is updated to new one, 
a new rollout is triggered and a new deploymant revision is created named revision 2,(helps track of deployment and enables us to rollback).

Deployment Strategies::
	Recreate || Rollingupdate(By default)
Recraete: delete(Destroy) all the pods and then spin-up new pods (Not efficient(not good pratice), we can see app down time)
	if their is some problem in new version untill it get fixed their is no pods and no application running,  
Rolling Update(Default): will delete some and spin-up some, and then delete some and then again spin-up some, no down time of app 
	if their is some problem in new version only first few pods get down and remaning all are in the running state (No down time) 
	whenever problem resolve and get spin-up new ones then only the remaning goes for update
	
How Upgrade works::
**Imp: It create a new replicaset automatically**
in old replica delete x no of pods and in new replica added x no of pods, 
simillarly does the process untill it reaches the desired value of pod in replicaset defined in yaml file,
if you undo the upgrade then same principle works


To upadte we have many options
1. do all the necessary changes in dep.yaml file and apply this command
kubectl apply -f <dep.yaml>

2.	kubectl set image <dep_name> <conatiner_name=image:tag>

kubectl describe deployment <name_dep>

kubectl rollout undo <dep_name>
===============================
::Networking in k8s::
	>Node has IP address, Usecase: access the k8 node, SSH into it,
	> IP address is assigned to a pod. Each pod in k8 gets its own internal IP with a series (ex: 10.244.0.2, 10.244.0.3, 10.244.0.4)
	why and how this 10.244.X.X series, when k8 initially config, we create an internal private network with address (i.e., 10.244.0.0) and all the pods are attached to it.
	when you deploy multiple pods, they all get a seperate IP assigned from this n/w.
	The pods can communicate with each other through this IP. But accessing the other pods using this internal IP addree may not be a good idea, as its sub to changes when pods are recreated.
	
	Multiple Nodes:
	if two nodes running k8 and they have IP address(not a part of the cluster yet), Each of them has a single pod deployed, these pods are attached to internal network and they have ther own IP address assigned.
	problem arise:
		 same n/w and same IP causes conflit. k8 dosen't automatically setup any kind of n/w to handle these issues.
	so we need to setup n/w to meet certain fund,
		All containers/PODs can communicateto one another without NAT,
		All nodes can communicate with all containers and vice-verca without NAT.
		pre-build solutions:-
			CISCO ACI n/w, Cilium, flannel, VMware NSX-T, Big cloud fabric, calico, 
			if scratch > calico/fannel is best, k8 labs weave net
		by using the above, it now manages the n/w and IPs in my nodes and assign a diff n/w add for each n/w in node.
	This crate a virtual n/w of all pods and nodes where they are all assigned a unique IP address, 
	by using simple routing techniques the cluster n/w enables communication b/w the different pods and nodes
===============================
:::Services in k8's:::
Enables communication b/w various comp within and outside of the app,
help us to connect app together with other apps or users
ex:- services enable the frontend app tot he user, 
	helps communication b/w backend and frontend pods, 
	and helps establishing connectivity to the external data source(database)
	services enables loose coupling b/w microservices in our app
ex:-
i have laptop ip(192.168.1.10) in my laptop i have a node ip as (192.168.1.2) inside node we have a private n/w of ip as(10.244.0.0)
our pod is runing on internal n/w so our pod ip is series of 10.244.X.X for instance (10.244.0.2) which runing my froentend application
Now i want to see my app in my laptop browser
how?
1st we need to SSH to k8 node from our laptop and from the node we would be access to access the pod's web page by doing curl or GUI
reason: Both are in same N/w(Node and pod) but it is inside the k8 node, 
"not good pratice", i want to hit the laptop ip and want to see the runing app,
now services comes into the picture, 
it is like a object in k8 node, just simply forming node forwarding from external(listen) to internal(forward)

Services types::
Nodeport: where the service makes an internal pod accessible on a port on the node.
ClusterIP: create a virtual ip inside the cluster to enab;e the comm b/w different services such as set of frontend/backend servers.
Loadbalancer: it provision a load balancer to the app in support cloud providers(distribute load accross diff web servers)

Let's depp dive into one after other
Nodeport: 
mapping a port on the node to a port on the pod, 
the port on the pod actual web server is running, ie., (80)and it refer to target port, 
service is like a virtual server inside the node, inside cluseter it has its own IP address called clusterIP of the service. 
and finally we have a port on node itself, which we use access to webserver externally(nodeport) ie., 30008 (valid range 30,000 to 32,767)
curl htp://XXXXXXX:30008
How to write a file?
as similar to above files, 4 sections, 
apiVersion: v1
kind: service
metadata:
spec: 
only difference b/w we can see in spec section we have type=nodeport and ports and have to define selector to identify the pods

what if we have multiple pods??
by using selector and label, service automatically connects all the node that is same label, uses random algo to disrtibute the traffic

what if we have multiple nods??
k8's automatically expands services to all the nodes in cluster and maps the target port to same node port on all the nods in the cluster.
can access app using any ip address but same port number 30008, 

ClusterIP:
ex: a full stack app having fronetend, backend, database
need to communicate each other? and if the old pods goes down, create new pod with different IP, so it's hard to commmunicate with IP address as discussed in previous(Nodeport)
so lets create a service cluster ip for all the frontend, simillarly create clusterIP for all the backend, and simillarly for all the databases, 
(no need to take care about individual ip-address)automatically service will take care about it by using selector and label, just we need to create a service of ClusterIP for each set of types of pods(frontend, backend, databases)
apiVersion: v1
kind: service
metadata:
spec: 
only difference b/w we can see in spec section we have type=ClusterIP and ports and have to define selector to identify the pods

::NOTE::
let's for example we have 4 nodes, out of these we have two node running voting-app with 1pod and 2 pods
and other two are running results app with 1 pod and 2 pods, 
now we created a 2 service one for voting and one for results, 
we are able to access the voting node ip to the results app by using it's portnumber (because service is created all over) simillary vice-versa
 

Loadbalancer:

===============================
:::K8's in cloud:::

Self Hosted:
	provision & Configure VMs, Use script to deploy cluster, maintain vm ourself, 
	Ex: Kubernetes on AWS using kops/ KubeOne.
Hosted Solutions:
	K8-as-a-service, Providers provision vm's / install K8's / maintain vm's.
	ex: GKE(Google Kubernates Engine), Azure Kubernetes Service(AKS), Amazon Elastic kubernetes Service(EKS).

===============================
>>YAML file is used to represent configuration data.

:::CMD::: 
kubectl get all >> to get all obj of k8
kubectl run <> ==> to deploy an application on the cluster.
kubectl cluster-info ==> used to view information about cluster
kubectl get nodes ==> to list all the nodes part of cluster
kubectl get nodes
kubectl create deployment hello-minikube --image=k8s.grc.io/echoserver:1.10 (Refer doc: <<https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download>>)
kubectl get deployment
kubectl expose deployment hello-minikube --type=NodePort --port=8080
minikube service hello-minikube --url
kubectl run ngx --image nginx ==> created 
kubectl describe pod <ngx>



kubectl create -f <yaml_file>
kubectl apply -f <yaml_file>
kubectl get pods
kubectl get po
kubectl get pods -o wide
kubectl describe pod <pod_name>

kubectl run redis --image=redis123 --dry-run=client -o yaml > redis-definition.yaml
kubectl edit pod <pod_name>
kubectl replace -f <yaml_file> >> did any change in yaml afile nd want to apply the changes then use this cmd.
Diff?
kubectl run ngx --image nginx ==> created 
kubectl create deployment ngx --image=nginx 

kubectl explian replicaset
kubectl get replicationcontroller
kubectl get replicaset
kubectl get rs
kubectl describe replicaset 
kubectl delete replicaset
kubectl replace -f <replace.yaml>
kubectl scale --replicas=10 -f replicaset
kubectl sclae --replicas=10 replicaset(type) myap-replicaset(name)
kubectl api-resources | grep replicaset
kubectl explain replicaset | grep VERSION
kubectl delete replicaset <name>
kubectl edit replicaset <name>
kubectl scale replicaset <name> --replicas=2

kubectl create -f deployment.yaml
kubectl get deployments
kubectl get replicaset
kubectl get pods
kubectl create deployment "abc" --image:"im" --replicas=3

kubectl cetare -f deploy.yaml
kubectl get deploy
kubectl apply -f dep.yaml
kubectl rollout status <name_deployment> >>
kubectl rollout history <name_deployment>
1. do all the necessary changes in dep.yaml file and apply this command
kubectl apply -f <dep.yaml>
2.	kubectl set image <dep_name> <conatiner_name=image:tag>

kubectl describe deployment <name_dep>

kubectl rollout undo <dep_name>


kubectl create -f service.yaml
kubectl get services



:::Hiraricy:::
Image >> Container >> Pods >> Replicaset >> Deployment >>
```
