mkdir ..\saturn\data\elasticsearch
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -v %cd%/../saturn/data/elasticsearch:/usr/share/elasticsearch/data docker.elastic.co/elasticsearch/elasticsearch:6.6.2
