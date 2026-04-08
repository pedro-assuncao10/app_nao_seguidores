export const handler = async (event) => {
  // Ignora chamadas que não sejam POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Descobre o link do seu site (para mandar o usuário de volta depois do pagamento)
    const host = event.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 2. Montamos o pacote EXATAMENTE como a InfinitePay pediu
    const payload = {
      handle: "daniel-carlos-9u1",
      // Adicionamos a URL de redirecionamento para ver se a API aceita trazer o cliente de volta automaticamente
      redirect_url: `${baseUrl}/?status=approved`, 
      items: [
        {
          quantity: 1,
          price: 90, // Valor em centavos: 1990 = R$ 19,90
          description: "Acesso VIP - UnfollowTracker" // O texto exato que aparecerá na tela do PIX
        }
      ]
    };

    // 3. Enviamos o pedido para o link do Checkout Integrado que o seu cliente achou
    const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 4. Devolvemos para o React o link do checkout gerado
    if (data.url || data.link) {
      return {
        statusCode: 200,
        body: JSON.stringify({ init_point: data.url || data.link })
      };
    } else {
      console.error("Resposta estranha da InfinitePay:", data);
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