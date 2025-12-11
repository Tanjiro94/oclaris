import { ollamaGenerate } from './ollamaClient.js';

export type RefinePromptInput = {
    brief: string;
    creativeConstraints?: string;
    styles: string[];
    useGear: boolean;
    gearList: { type: string; brand: string; model: string }[];
};

export type RefinePromptResult = {
    improvedPrompt: string;
    technicalAdvice: string;
    locationSuggestions: string[];
};

function buildFallbackResult(input: RefinePromptInput): RefinePromptResult {
    const stylePart = input.styles.length
        ? `Styles visés : ${input.styles.join(', ')}. `
        : '';

    const constraintsPart = input.creativeConstraints
        ? `Contraintes créatives : ${input.creativeConstraints}. `
        : '';

    const gearPart =
        input.useGear && input.gearList.length > 0
            ? `Matériel disponible : ${input.gearList
                    .map((g) => `${g.type} ${g.brand} ${g.model}`)
                    .join(', ')}. `
            : 'Matériel non spécifié. ';

    const improvedPrompt = [
        'Direction artistique :',
        input.brief,
        stylePart,
        constraintsPart,
        gearPart,
        'Focus sur une lumière cohérente, une palette de couleurs maîtrisée et des compositions fortes.',
    ].join(' ');

    const technicalAdvice =
        'Utilise une lumière principale douce légèrement latérale, complète éventuellement avec un fill léger. ' +
        'Construis ta série avec des plans larges pour le contexte, puis des plans moyens et serrés pour les émotions. ' +
        (input.useGear
            ? 'Exploite au maximum ton matériel (ouvertures lumineuses, focales variées) pour jouer sur la profondeur de champ.'
            : 'Même sans setup complexe, privilégie la lumière naturelle directionnelle (fenêtre, golden hour).');

    const locationSuggestions = [
        'Un lieu cohérent avec le style dominant (urbain, nature, industriel...).',
        'Un endroit avec une lumière intéressante (fenêtres grandes, ombres graphiques).',
        'Un environnement où le sujet peut interagir naturellement avec l’espace.',
    ];

    return {
        improvedPrompt,
        technicalAdvice,
        locationSuggestions,
    };
}

export async function refinePromptWithAI(
    input: RefinePromptInput,
): Promise<RefinePromptResult> {
    const fallback = buildFallbackResult(input);

    try {
        const stylesText = input.styles.length
            ? input.styles.join(', ')
            : 'aucun style spécifique';

        const constraintsText = input.creativeConstraints?.trim()?.length
            ? input.creativeConstraints
            : 'pas de contraintes particulières';

        const gearText =
            input.useGear && input.gearList.length > 0
                ? input.gearList
                    .map((g) => `${g.type} ${g.brand} ${g.model}`)
                    .join(', ')
                : "aucun matériel spécifique fourni par le photographe";

        const system =
            "Tu es un photographe professionnel expérimenté et un excellent rédacteur. " +
            "Tu réponds TOUJOURS en français, avec un ton professionnel mais accessible. " +
            "Ton français doit être naturel, fluide, sans fautes de grammaire ni d’orthographe, et sans anglicismes inutiles. " +
            "Tu adaptes tes conseils au niveau d’un photographe réel sur le terrain. " +
            "Ta sortie doit être STRICTEMENT un JSON valide, sans texte avant ni après.";

        const prompt = `
Contexte du shooting photo :

Brief :
"${input.brief}"

Styles souhaités :
${stylesText}

Contraintes créatives :
${constraintsText}

Matériel du photographe :
${gearText}

Tâches :

1) Prompt optimisé (improvedPrompt)
- Réécris un prompt optimisé pour un générateur d'images (type Stable Diffusion / DALL·E).
- En français uniquement.
- Complet, précis, cohérent avec le brief.
- Incluant : style visuel, ambiance, lumière, cadrage, rendu / esthétique générale.
- Un seul bloc de texte, sans listes, sans numérotation.
- Ne mets PAS de réglages techniques (ouverture, vitesse, ISO) dans ce prompt : il doit décrire l'image, pas les réglages de prise de vue.

2) Conseils techniques (technicalAdvice)
- Donne des conseils techniques CONCRETS pour réaliser ce shooting en conditions réelles.
- Baser les conseils sur le matériel réellement fourni ci-dessus : ne pas inventer de matériel inexistant.
- Inclure si possible :
- des plages de réglages raisonnables : ouverture, vitesse, ISO
- le type et la direction de lumière (naturelle / artificielle, dure / douce, côté, contre-jour, etc.)
- des idées de focales / cadrages (plan large, plan serré, plongée / contre-plongée, etc.)
- des astuces de prise de vue : gestion du modèle, mouvement, arrière-plan, gestion du flou d’arrière-plan, etc.
- Le texte doit être bien rédigé, structuré en 2–4 paragraphes courts (sans titres) et facile à appliquer sur le terrain.

3) Lieux proposés (locationSuggestions)
- Propose 3 à 5 suggestions de lieux pertinents pour ce shooting, cohérents avec le brief, le style et les contraintes.
- Tu peux proposer des types de lieux (ex : "une ruelle pavée avec néons", "un rooftop moderne avec garde-corps en verre") et non des adresses réelles.
- Les lieux doivent être réalistes et faciles à comprendre pour un photographe.

Format de réponse :

Répond STRICTEMENT avec un JSON VALIDE de cette forme, sans texte avant ni après :

{
"improvedPrompt": "texte du prompt optimisé",
"technicalAdvice": "texte des conseils techniques en plusieurs paragraphes",
"locationSuggestions": ["Lieu 1", "Lieu 2", "Lieu 3"]
}
`;

        const raw = await ollamaGenerate({
            model: process.env.OLLAMA_MODEL ?? 'llama3',
            system,
            prompt,
        });

        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        const jsonStr =
            start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;

        const parsed = JSON.parse(jsonStr) as Partial<RefinePromptResult>;

        if (
            !parsed ||
            typeof parsed.improvedPrompt !== 'string' ||
            typeof parsed.technicalAdvice !== 'string' ||
            !Array.isArray(parsed.locationSuggestions)
        ) {
            return fallback;
        }

        return {
            improvedPrompt: parsed.improvedPrompt.trim(),
            technicalAdvice: parsed.technicalAdvice.trim(),
            locationSuggestions: parsed.locationSuggestions.map((s) =>
                String(s),
            ),
        };
    } catch (e) {
        console.error('[AI] refinePromptWithAI error, fallback used', e);
        return fallback;
    }
}
