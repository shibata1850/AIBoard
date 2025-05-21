const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

const apiKey = 'AIzaSyDaHD5V0kDzRjSaq0gHM8Fk_GyAJteUdX4';

async function checkDomainRestrictions() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-1.5-flash?key=' + apiKey,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('API Key Domain Check Status Code:', res.statusCode);
        console.log('API Key Domain Check Headers:', JSON.stringify(res.headers, null, 2));
        
        if (res.statusCode === 200) {
          console.log('API key has no domain restrictions');
          resolve(true);
        } else {
          try {
            const parsedData = JSON.parse(data);
            console.log('API Key Domain Check Response:', JSON.stringify(parsedData, null, 2));
            
            if (parsedData.error && parsedData.error.message) {
              console.log('API Key Error Message:', parsedData.error.message);
              
              if (parsedData.error.message.includes('API key not valid') || 
                  parsedData.error.message.includes('expired') ||
                  parsedData.error.message.includes('invalid')) {
                console.log('API key is invalid or expired');
              } else if (parsedData.error.message.includes('referer') || 
                         parsedData.error.message.includes('domain') ||
                         parsedData.error.message.includes('origin')) {
                console.log('API key has domain restrictions');
              }
            }
          } catch (e) {
            console.log('Error parsing response:', e);
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error checking domain restrictions:', error);
      resolve(false);
    });
    
    req.end();
  });
}

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API with key:', apiKey);
    
    const domainCheckResult = await checkDomainRestrictions();
    console.log('Domain check result:', domainCheckResult);
    
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
    console.error('Error details:', JSON.stringify(error, null, 2));
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
