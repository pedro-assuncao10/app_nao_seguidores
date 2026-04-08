export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const host = event.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Gera um ID único para o pedido (essencial para a InfinitePay rastrear e não dar erro)
    const orderNsu = "PEDIDO-" + Date.now();

    const payload = {
      handle: "daniel-carlos-9u1",
      redirect_url: `${baseUrl}/?status=approved`, 
      order_nsu: orderNsu, // <-- Adicionando o campo que o Daniel mandou!
      items: [
        {
          quantity: 1,
          price: 1000, 
          description: "Acesso VIP - UnfollowTracker"
        }
      ]
    };

    const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.url || data.link) {
      return {
        statusCode: 200,
        body: JSON.stringify({ init_point: data.url || data.link })
      };
    } else {
      console.error("Resposta de erro da InfinitePay:", data);
      throw new Error("Link não retornado pela InfinitePay");
    }

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao gerar pagamento na InfinitePay." })
    };
  }
};