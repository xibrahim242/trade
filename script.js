// script.js
const config = {
    initialPrice: 2300.00,
    initialBalance: 100000,
    volatility: 0.035,
    newsInterval: 4500,
    commission: 0.0015,
    maxHistory: 60
};

let currentPrice = config.initialPrice;
let balance = config.initialBalance;
let holdings = 0;
let priceHistory = Array(config.maxHistory).fill(config.initialPrice);
let isDarkMode = localStorage.getItem('theme') === 'dark';

// Grafik Başlatma
const ctx = document.getElementById('priceChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [...Array(config.maxHistory).keys()],
        datasets: [{
            label: 'XAU/USD',
            data: priceHistory,
            borderColor: 'var(--chart-color)',
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'var(--secondary-bg)',
                titleColor: 'var(--primary-text)',
                bodyColor: 'var(--primary-text)',
                borderColor: 'var(--border)',
                borderWidth: 1
            }
        },
        scales: {
            x: { display: false },
            y: {
                beginAtZero: false,
                grace: '8%',
                grid: { color: 'var(--border)' },
                ticks: {
                    color: 'var(--primary-text)',
                    callback: value => `$${value.toFixed(2)}`,
                    maxTicksLimit: 6
                }
            }
        }
    }
});

// Piyasa Simülasyonu
function updateMarket() {
    const randomChange = (Math.random() * 2 - 1) * config.volatility;
    const momentum = priceHistory.length > 1 ? 
        (priceHistory[priceHistory.length-1] - priceHistory[priceHistory.length-2]) * 0.25 : 0;
    
    currentPrice = currentPrice * (1 + randomChange + momentum);
    currentPrice = parseFloat(currentPrice.toFixed(2));
    
    priceHistory.push(currentPrice);
    priceHistory.shift();
    
    updateChart();
    updateDisplay();
}

// Haber Sistemi
const newsDatabase = [
    { msg: "FED Faiz Kararı: %0.75 Artış", impact: -0.06, category: 'fed' },
    { msg: "Orta Doğu'da Gerilim Tırmanıyor", impact: 0.09, category: 'savaş' },
    { msg: "Enflasyon Verileri Açıklandı", impact: 0.07, category: 'ekonomi' },
    { msg: "Altın Üretiminde Rekor Düşüş", impact: 0.05, category: 'üretim' },
    { msg: "Dolar Endeksi Yükselişte", impact: -0.08, category: 'dolar' },
    { msg: "Merkez Bankası Altın Aldı", impact: 0.06, category: 'cb' },
    { msg: "Yeni Maden Yasası Yürürlükte", impact: -0.04, category: 'yasa' },
    { msg: "Küresel Ekonomide Belirsizlik", impact: 0.10, category: 'ekonomi' }
];

function generateNews() {
    const news = newsDatabase[Math.floor(Math.random() * newsDatabase.length)];
    const impactValue = currentPrice * news.impact;
    currentPrice += impactValue;
    currentPrice = parseFloat(currentPrice.toFixed(2));
    
    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.style.borderLeftColor = news.impact > 0 ? 
        'var(--news-positive)' : 'var(--news-negative)';
    newsElement.innerHTML = `
        <div class="news-content">
            <div class="news-title">${news.msg}</div>
            <div class="news-impact ${news.impact > 0 ? 'positive' : 'negative'}">
                ${news.impact > 0 ? '▲' : '▼'} $${Math.abs(impactValue.toFixed(2))}
            </div>
            <div class="news-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    const newsFeed = document.getElementById('newsFeed');
    newsFeed.prepend(newsElement);
    if(newsFeed.children.length > 10) newsFeed.lastChild.remove();
}

// Tema Yönetimi
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    chart.update();
}

// İşlem Fonksiyonları
function placeOrder(type) {
    const quantity = parseFloat(document.getElementById('quantity').value);
    const total = quantity * currentPrice;
    const commission = total * config.commission;
    
    if(type === 'buy') {
        if(total + commission > balance) return showAlert('Yetersiz Bakiye!', 'error');
        balance -= total + commission;
        holdings += quantity;
    } else {
        if(quantity > holdings) return showAlert('Yetersiz Ons!', 'error');
        balance += total - commission;
        holdings -= quantity;
    }
    
    addTransaction(type, quantity, total);
    updateDisplay();
}

function addTransaction(type, quantity, amount) {
    const transaction = document.createElement('div');
    transaction.className = `history-item ${type}`;
    transaction.innerHTML = `
        <span>${type === 'buy' ? 'ALIŞ' : 'SATIŞ'}</span>
        <span>${quantity.toFixed(2)} Ons</span>
        <span>$${amount.toFixed(2)}</span>
    `;
    document.getElementById('historyList').prepend(transaction);
}

// Görsel Güncellemeler
function updateDisplay() {
    document.querySelector('.cash-balance').textContent = `$${balance.toFixed(2)}`;
    document.querySelector('.portfolio-value').textContent = `$${(holdings * currentPrice).toFixed(2)}`;
    document.querySelector('.current-price').textContent = `$${currentPrice.toFixed(2)}`;
}

function updateChart() {
    chart.data.datasets[0].data = priceHistory;
    chart.update();
}

// Sistem Başlatma
setInterval(updateMarket, 2000);
setInterval(generateNews, config.newsInterval);

// Tema Kontrolü
if(isDarkMode) document.body.setAttribute('data-theme', 'dark');
chart.update();
