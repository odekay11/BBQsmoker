export const mqttConfig = {
  url: process.env.NEXT_PUBLIC_MQTT_HOST!,
  options: {
    username: process.env.NEXT_PUBLIC_MQTT_USER!,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD!,
    clientId: `WebClient_${Math.random().toString(16).slice(2)}`,
    clean: true,
    reconnectPeriod: 3000,
  },
  topics: {
    chamber: 'smoker/chamber/temperature',
    meat:    'smoker/meat/temperature',
    target:  'smoker/target/temperature',
    ssr:     'smoker/ssr/status',
  }
}
