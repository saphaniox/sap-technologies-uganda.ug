// Quick test to exercise apiService cache logic
import apiService from './src/services/api';

(async () => {
  try {
    // Simulate storing cache
    apiService.setCache('GET:https://example.com/api/test', { data: { msg: 'hello' } });
    const cached = apiService.getCached('GET:https://example.com/api/test');
    console.log('Cached found:', cached?.data?.msg === 'hello');

    // Simulate mutation and clear
    apiService.clearCache();
    const afterClear = apiService.getCached('GET:https://example.com/api/test');
    console.log('Cache cleared:', afterClear === null);
  } catch (err) {
    console.error('Test failed:', err);
  }
})();