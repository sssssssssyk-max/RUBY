import { ctx } from './env.js';

const SOURCE_LABELS = {
    openai: 'OpenAI',
    claude: 'Claude',
    openrouter: 'OpenRouter',
    ai21: 'AI21',
    makersuite: 'Google AI Studio',
    vertexai: 'Vertex AI',
    mistralai: 'Mistral AI',
    custom: '自定义 OpenAI 兼容端点',
    cohere: 'Cohere',
    perplexity: 'Perplexity',
    groq: 'Groq',
    electronhub: 'ElectronHub',
    chutes: 'Chutes',
    nanogpt: 'NanoGPT',
    deepseek: 'DeepSeek',
    aimlapi: 'AI/ML API',
    xai: 'xAI',
    pollinations: 'Pollinations',
    moonshot: 'Moonshot',
    fireworks: 'Fireworks AI',
    cometapi: 'CometAPI',
    azure_openai: 'Azure OpenAI',
    zai: 'Z.AI',
    siliconflow: 'SiliconFlow',
    workers_ai: 'Cloudflare Workers AI',
    minimax: 'MiniMax',
    aws_bedrock: 'AWS Bedrock',
    custom_openai_responses: '自定义 OpenAI Responses',
    custom_claude_messages: '自定义 Claude Messages',
    custom_gemini_interactions: '自定义 Gemini Interactions',
};

const CUSTOM_SOURCE_BY_FORMAT = {
    openai_responses: 'custom_openai_responses',
    claude_messages: 'custom_claude_messages',
    gemini_interactions: 'custom_gemini_interactions',
};

const emptyEntry = () => ({
    include_body: '',
    exclude_body: '',
    include_headers: '',
});

const asString = (value) => typeof value === 'string' ? value : '';

export function getAdditionalParametersSourceKey(settings) {
    const source = String(settings?.chat_completion_source || 'openai');
    if (source !== 'custom') return source;
    return CUSTOM_SOURCE_BY_FORMAT[String(settings?.custom_api_format || '')] || 'custom';
}

export function getAdditionalParametersSourceLabel(sourceKey) {
    return SOURCE_LABELS[sourceKey] || sourceKey || '当前 API';
}

function getStore(settings) {
    const current = settings.additional_parameters_by_source;
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
        settings.additional_parameters_by_source = {};
    }
    return settings.additional_parameters_by_source;
}

function normalizeEntry(value) {
    const entry = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
        include_body: asString(entry.include_body),
        exclude_body: asString(entry.exclude_body),
        include_headers: asString(entry.include_headers),
    };
}

export function getNativeAdditionalParameters() {
    const c = ctx();
    const settings = c?.chatCompletionSettings;
    if (!settings || typeof settings !== 'object') {
        return {
            supported: false,
            sourceKey: '',
            sourceLabel: '酒馆 API 设置不可用',
            ...emptyEntry(),
        };
    }

    const sourceKey = getAdditionalParametersSourceKey(settings);
    const entry = normalizeEntry(getStore(settings)[sourceKey]);
    return {
        supported: true,
        sourceKey,
        sourceLabel: getAdditionalParametersSourceLabel(sourceKey),
        ...entry,
    };
}

export function saveNativeAdditionalParameters(patch = {}) {
    const c = ctx();
    const settings = c?.chatCompletionSettings;
    if (!settings || typeof settings !== 'object') return null;

    const sourceKey = getAdditionalParametersSourceKey(settings);
    const store = getStore(settings);
    const entry = normalizeEntry({
        ...normalizeEntry(store[sourceKey]),
        ...patch,
    });
    store[sourceKey] = entry;

    if (typeof c.saveSettingsDebounced === 'function') {
        c.saveSettingsDebounced();
    }

    return {
        supported: true,
        sourceKey,
        sourceLabel: getAdditionalParametersSourceLabel(sourceKey),
        ...entry,
    };
}
