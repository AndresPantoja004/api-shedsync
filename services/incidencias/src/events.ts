import amqp, { type Channel } from 'amqplib';
import { config } from './config';

const EXCHANGE = 'schedsync.events';
let channel: Channel | null = null;

export async function connect(): Promise<Channel | null> {
  if (!config.amqpUrl) {
    console.log(`[${config.serviceName}] AMQP_URL no definido: eventos deshabilitados`);
    return null;
  }
  try {
    const conn = await amqp.connect(config.amqpUrl);
    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log(`[${config.serviceName}] conectado a RabbitMQ`);
  } catch (e) {
    console.log(`[${config.serviceName}] RabbitMQ no disponible: ${(e as Error).message}`);
  }
  return channel;
}

export async function publish(routingKey: string, payload: unknown): Promise<boolean> {
  if (!channel) return false;
  return channel.publish(
    EXCHANGE,
    routingKey,
    Buffer.from(JSON.stringify({ event: routingKey, data: payload, ts: Date.now() })),
    { persistent: true },
  );
}

export { EXCHANGE };