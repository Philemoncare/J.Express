import axios from 'axios';

// Cache for exchange rates
let exchangeRates: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour

export const getExchangeRate = async (from: string, to: string): Promise<number> => {
    if (from === to) return 1;

    const now = Date.now();
    if (!exchangeRates || (now - lastFetchTime) > CACHE_DURATION) {
        try {
            // Use a 5s timeout to prevent hanging the whole request
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, { timeout: 5000 });
            exchangeRates = response.data.rates;
            lastFetchTime = now;
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            // Return cached rates if available even if expired, to avoid blocking
            if (exchangeRates) return exchangeRates[to] || 1;
            return 1;
        }
    }

    return exchangeRates[to] || 1;
};

export const formatCurrency = (amount: number, currency: string = 'GHS') => {
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return `${currency} ${formatted}`;
};
