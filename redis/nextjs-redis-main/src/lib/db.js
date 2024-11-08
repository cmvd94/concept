import { createClient } from 'redis';

const client = createClient({
    password: 'UgiWibAzKYWrKYQhYMYMW2VA2Q2fv6TH',
    socket: {
        host: 'redis-13885.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 13885
    }
});

client.on('error', err => console.log(err))

if (!client.isOpen) {
  client.connect()
}

// client.set('name', 'mario')

export { client }