# Callisto
Service for sending notifications. The service listens to the RabbitMQ event bus and sends emails
based on certain events.

## Starting the service
The `src` directory contains the actual application. It can be run from the IDE or from the command line
using gradle: `gradle bootRun`.

## Starting with Kubernetes

See [charts readme](/charts/callisto/README.md)

## RabbitMQ
Neptune is configured to emit events to RabbitMQ. Disabling rabbitMQ can be done by setting
the following properties in the configuration:
 ```yaml
app.rabbitmq.enabled: false
spring.autoconfigure.exclude: org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration
```
 You can configure RabbitMQ using the [default Spring settings](https://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html#common-application-properties):
 ```yaml
spring.rabbitmq.host:
spring.rabbitmq.username:
spring.rabbitmq.password:
spring.rabbitmq.virtual-host:
```
 The topology can be defined in the application.yaml properties:
 ```yaml
  app:
    rabbitmq:
      topology:
        collections:
          exchange: "collections"
          queues:
            addPermission: "collections.callisto.add_permission"
```

### Local setup of RabbitMQ
You can run a local RabbitMQ instance easily using its docker image. Run the following command:

```bash
docker run --rm -p 5672:5672 -p 15672:15672 rabbitmq:management
```

## Developers

If you want to develop on Callisto, it is recommended to activate the dev Spring profile. This points to RabbitMQ 
on localhost (see above) and you can enter your own mail settings there. To do so set SPRING_PROFILE=dev in your 
environment variables.
