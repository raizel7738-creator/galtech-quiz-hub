const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API call...');
    
    const response = await axios.get('http://localhost:5000/api/questions/category/68b70b32325579429c94b7ee', {
      params: {
        limit: 10,
        type: 'mcq',
        _t: Date.now(),
        _v: Math.random(),
        _refresh: 'true'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.questions.length > 0) {
      const firstQuestion = response.data.data.questions[0];
      console.log('\nFirst Question Details:');
      console.log('Question Text:', firstQuestion.question);
      console.log('Options:', firstQuestion.options);
    }
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testAPI();

