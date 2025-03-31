// Konfigürasyon
const config = {
    initialPrice: 2300.00,
    initialBalance: 100000,
    volatility: {
        normal: 0.02,
        high: 0.05
    },
    newsInterval: 15000,
    marketUpdateInterval: 1000,
    commission: 0.0015,
    historyLength: 100,
    maWindow: 20,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30
};

// Durum değişkenleri
let currentPrice = config.initialPrice;
let lastPrice = config.initialPrice;
let balance = config.initialBalance;
let holdings = 0;
let initialValue = config.initialBalance;
let transactions = [];
let priceHistory = Array(config.historyLength).fill(config.initialPrice);
let priceChanges = Array(config.historyLength - 1).fill(0);
let maValues = Array(config.historyLength).fill(config.initialPrice);
let rsiValues = Array(config.historyLength).fill(50);
let activeAlerts = [];
let isAutoTradingActive = false;
let currentStrategy = null;
let simulationTime = 0;
let isDarkMode = localStorage.getItem('theme') === 'dark';
let volatilityMode = 'normal';
let lastTradePrice = 0;
let currentPositionCost = 0;
let highestBalance = config.initialBalance;
let lowestBalance = config.initialBalance;

// Grafik nesneleri
let priceChart;
let rsiChart;

// Piyasa ve simülasyonu başlat
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadData();
    updateDisplay();
    updateTradeInfo();
    setInterval(updateMarket, config.marketUpdateInterval);
    setInterval(generateNews, config.newsInterval);
    setInterval(updateSimulationTime, 1000);
    
    // Miktar değiştiğinde ticaret bilgilerini güncelle
    document.getElementById('quantity').addEventListener('input', updateTradeInfo);
    
    // Tema kontrolü
    if(isDarkMode) document.body.setAttribute('data-theme', 'dark');
});

// Grafikleri başlat
function initCharts() {
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    
    priceChart = new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: Array(config.historyLength).fill('').map((_, i) => i + 1),
            datasets: [
                {
                    label: 'XAU/USD',
                    data: priceHistory,
                    borderColor: 'var(--chart-line)',
                    backgroundColor: 'transparent',
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'var(--chart
