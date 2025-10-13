'use server'; // Adicionar esta diretiva para garantir que este módulo seja executado apenas no servidor.

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// É crucial que GOOGLE_API_KEY esteja disponível no ambiente do servidor.
// Next.js carrega automaticamente variáveis de ambiente de .env.local, .env.development, etc.
// Certifique-se de ter GOOGLE_API_KEY definida em um desses arquivos.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  // Lança um erro claro se a chave da API estiver faltando, pois o Genkit não funcionará.
  throw new Error('A variável de ambiente GOOGLE_API_KEY não está definida. Por favor, defina-a no seu arquivo .env.local.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_API_KEY })], // Passa a chave da API explicitamente para o plugin
  model: 'googleai/gemini-2.5-flash',
});