import { MercadoPagoConfig, Payment } from 'mercadopago';

export const handler = async (event) => {
  // Pega o ID do pagamento que o React vai enviar pela URL
  const paymentId = event.queryStringParameters.payment_id;

  if (!paymentId) {
    return { statusCode: 400, body: JSON.stringify({ error: "ID não fornecido" }) };
  }

  try {
    // Inicia o Mercado Pago com sua chave secreta salva no painel do Netlify
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = new Payment(client);

    // Pergunta ao Mercado Pago qual o status REAL e atualizado desse pagamento
    const response = await payment.get({ id: paymentId });

    // Devolve para o React o status atualizado
    return {
      statusCode: 200,
      body: JSON.stringify({ status: response.status })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao consultar o Mercado Pago" })
    };
  }
};