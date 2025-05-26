const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Available Gemini models for document analysis
 */
const GeminiModel = {
  GEMINI_2_FLASH: 'gemini-2.0-flash',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_PRO: 'gemini-pro'
};

/**
 * Default model capabilities
 */
const DEFAULT_CAPABILITIES = {
  [GeminiModel.GEMINI_2_FLASH]: {
    supportsPdf: true,
    supportsImages: true,
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  [GeminiModel.GEMINI_1_5_FLASH]: {
    supportsPdf: true,
    supportsImages: true,
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  [GeminiModel.GEMINI_1_5_PRO]: {
    supportsPdf: true,
    supportsImages: true,
    maxInputTokens: 1000000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  [GeminiModel.GEMINI_PRO]: {
    supportsPdf: false,
    supportsImages: true,
    maxInputTokens: 30720,
    maxOutputTokens: 4096,
    isAvailable: true
  }
};

/**
 * Check if a model is available
 * @param apiKey Gemini API key
 * @param modelName Model name to check
 * @returns Promise with boolean indicating if the model is available
 */
async function isModelAvailable(apiKey, modelName) {
  try {
    console.log(`Checking availability of model: ${modelName}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = response.text();
    
    console.log(`Model ${modelName} is available, response: "${text.substring(0, 20)}..."`);
    return true;
  } catch (error) {
    console.error(`Error checking model ${modelName} availability:`, error);
    
    if (error.message && (
      error.message.includes('model not found') || 
      error.message.includes('not found for API version') ||
      (error.message.includes('model') && error.message.includes('not found'))
    )) {
      console.log(`Model ${modelName} is not available`);
      return false;
    }
    
    console.log(`Could not determine if model ${modelName} is available due to error`);
    return DEFAULT_CAPABILITIES[modelName]?.isAvailable || false;
  }
}

/**
 * Get the best available model for document analysis
 * @param apiKey Gemini API key
 * @param requirePdfSupport Whether PDF support is required
 * @returns Promise with the best available model name
 */
async function getBestAvailableModel(apiKey, requirePdfSupport = true) {
  console.log(`Finding best available model (requirePdfSupport: ${requirePdfSupport})`);
  
  const modelPreference = [
    GeminiModel.GEMINI_2_FLASH,
    GeminiModel.GEMINI_1_5_FLASH,
    GeminiModel.GEMINI_1_5_PRO,
    GeminiModel.GEMINI_PRO
  ];
  
  const eligibleModels = requirePdfSupport
    ? modelPreference.filter(model => DEFAULT_CAPABILITIES[model].supportsPdf)
    : modelPreference;
  
  console.log(`Eligible models: ${eligibleModels.join(', ')}`);
  
  for (const model of eligibleModels) {
    try {
      const available = await isModelAvailable(apiKey, model);
      if (available) {
        console.log(`Selected model: ${model}`);
        return model;
      }
    } catch (error) {
      console.warn(`Error checking availability for ${model}:`, error);
    }
  }
  
  console.warn('No models confirmed available, using first eligible model as fallback');
  return eligibleModels[0];
}

/**
 * Get model capabilities
 * @param modelName Model name
 * @returns Model capabilities
 */
function getModelCapabilities(modelName) {
  return DEFAULT_CAPABILITIES[modelName] || {
    supportsPdf: false,
    supportsImages: false,
    maxInputTokens: 30720,
    maxOutputTokens: 4096,
    isAvailable: false
  };
}

module.exports = {
  GeminiModel,
  isModelAvailable,
  getBestAvailableModel,
  getModelCapabilities
};
