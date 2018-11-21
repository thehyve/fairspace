# Callisto
Service sending out notifications 

### Configurable fields:

#### RabbitMQ
| Parameter  | Description  | Default |
|---|---|---|
| `rabbitmq.vhost` | Name of the virtual host used in rabbitmq | <workspace-name> |
| `rabbitmq.username` | Username for the rabbitmq user | <workspace-name>-callisto |
| `rabbitmq.password` | Password for the rabbitmq user |  |

#### Mail
Please note that mail settings are copied into the application.yaml configuration
file for spring. This means you can add any mail settings accepted by Spring mail
See e.g. https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-email.html
for more information.

The most common parameters are

| Parameter  | Description  | Default |
|---|---|---|
| `mail.host` | SMTP host |  |
| `mail.username` | SMTP username |  |
| `mail.password` | SMTP password |  |
| `app.mail.from` | Sender address for notification emails | info@fairspace.com  |
