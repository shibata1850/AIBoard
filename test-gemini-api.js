const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API with key:', apiKey);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Sending test request to Gemini API...');
    const result = await model.generateContent('Hello, this is a test message to verify the API key is working correctly.');
    const response = await result.response;
    const text = response.text();
    
    console.log('API Response:', text);
    console.log('API key is working correctly!');
    return true;
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    return false;
  }
}

testGeminiAPI().then(success => {
  if (success) {
    console.log('Test completed successfully!');
  } else {
    console.log('Test failed!');
  }
});
