type OllamaGenerateParams = {
    model?: string;
    prompt: string;
    system?: string;
};

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434';

export async function ollamaGenerate({
    model = 'llama3',
    prompt,
    system,
}: OllamaGenerateParams): Promise<string> {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            prompt,
            system,
            stream: false,
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
            `Erreur Ollama ${res.status}: ${text || res.statusText}`,
        );
    }

    const data = (await res.json()) as { response?: string };

    if (!data.response) {
        throw new Error("Réponse vide renvoyée par l'API Ollama");
    }

    return data.response.trim();
}
