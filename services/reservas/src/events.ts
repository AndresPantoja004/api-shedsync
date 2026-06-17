const amqp = require("amqplib");
const config = require("./config");

const EXCHANGE = "schedsync.events";
let channel = null;

async function connect() {
  if (!config.amqpUrl) {
    console.log(`[${config.serviceName}] AMQP_URL no definido: eventos deshabilitados`);
    return null;
  }
  try {
    const conn = await amqp.connect(config.amqpUrl);
    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    console.log(`[${config.serviceName}] conectado a RabbitMQ`);
  } catch (e) {
    console.log(`[${config.serviceName}] RabbitMQ no disponible: ${e.message}`);
  }
  return channel;
}

// publish("reserva.creada", { id_reserva, id_espacio, ... })
async function publish(routingKey, payload) {
  if (!channel) return false;
  return channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify({ event: routingKey, data: payload, ts: Date.now() })),
    { persistent: true }
  );
}

module.exports = { connect, publish, EXCHANGE };