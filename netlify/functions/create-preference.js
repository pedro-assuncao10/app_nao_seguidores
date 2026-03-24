import { MercadoPagoConfig, Preference } from 'mercadopago';

export const handler = async (event) => {
  // Ignora chamadas que não sejam POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Inicia o Mercado Pago usando a sua chave secreta salva no .env
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(client);

    // Descobre se estamos rodando local (localhost) ou já no site oficial publicado
    const host = event.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Cria o carrinho de compras e o link de pagamento
    const response = await preference.create({
      body: {
        items: [
          {
            id: 'unfollow-tracker-01',
            title: 'Acesso VIP - UnfollowTracker',
            quantity: 1,
            unit_price: 0.99,
            currency_id: 'BRL',
          }
        ],
        // Para onde o usuário volta após o pagamento
        back_urls: {
          success: `${baseUrl}/?status=success`,
          failure: `${baseUrl}/?status=failure`,
          pending: `${baseUrl}/?status=pending`
        },
        auto_return: 'approved',
      }
    });

    // Devolve para o React o link gerado (init_point)
    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: response.init_point })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao gerar pagamento." })
    };
  }
};
