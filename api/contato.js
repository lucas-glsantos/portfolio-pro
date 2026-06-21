export default async function handler(req, res) {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde instantaneamente requisições de teste do navegador (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Aceita somente requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Injeção ID do Formspree pelo Vercel
    const formspreeId = process.env.FORMSPREE_ID;

    if (!formspreeId) {
        return res.status(500).json({ error: 'Erro interno no Servidor' });
    }

    try {
        // Servidor Vercel envia para Formspree
        const formspreeRes = await fetch(`https://formspree.io/f/${formspreeId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body) // Envia os dados do formulário
        });

        if (formspreeRes.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Erro ao enviar para o Formspree' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no Servidor' });
    }
}