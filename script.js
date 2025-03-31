const config = {
    initialPrice: 2300.00,
    initialBalance: 100000,
    volatility: 0.035,
    newsInterval: 5000,
    commission: 0.0015,
    historyLength: 60
};

let currentPrice = config.initialPrice;
let balance = config.initialBalance;
let holdings = 0;
let priceHistory = Array(config.historyLength).fill(config.initialPrice);
let isDarkMode = localStorage.getItem('theme') === 'dark';

// Grafik Başlatma
const ctx = document.getElementById('priceChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: priceHistory.map((_, i) => i + 1),
        datasets: [{
            label: 'XAU/USD',
            data: priceHistory,
            borderColor: 'var(--chart-line)',
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false },
            y: {
                beginAtZero: false,
                ticks: {
                    color: 'var(--primary-text)',
                    callback: value => `$${value.toFixed(2)}`
                }
            }
        }
    }
});

// Piyasa Güncelleme
function updateMarket() {
    const randomChange = (Math.random() * 2 - 1) * config.volatility;
    currentPrice = currentPrice * (1 + randomChange);
    currentPrice = parseFloat(currentPrice.toFixed(2));
    
    priceHistory.push(currentPrice);
    priceHistory.shift();
    
    updateChart();
    updateDisplay();
}

// Haber Sistemi
const newsDatabase = [
    { msg: "FED Faiz Kararı Açıklandı", impact: -0.04 },
    { msg: "Altın Talebinde Artış", impact: 0.06 },
    { msg: "Dolar Endeksi Düşüşte", impact: 0.05 },
    { msg: "Siyasi Gerilimler Artıyor", impact: 0.07 },
    { msg: "Merkez Bankası Altın Aldı", impact: 0.03 }
];

function generateNews() {
    const news = newsDatabase[Math.floor(Math.random() * newsDatabase.length)];
    currentPrice = currentPrice * (1 + news.impact);
    currentPrice = parseFloat(currentPrice.toFixed(2));
    
    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.style.borderLeftColor = news.impact > 0 ? 'var(--positive)' : 'var(--negative)';
    newsElement.innerHTML = `
        <div>${news.msg}</div>
        <div>${news.impact > 0 ? '▲' : '▼'} $${Math.abs(currentPrice * news.impact).toFixed(2)}</div>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    document.getElementById('newsFeed').prepend(newsElement);
}

// Tema Değiştirme
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
        if(total + commission > balance) return alert('Yetersiz Bakiye!');
        balance -= total + commission;
        holdings += quantity;
    } else {
        if(quantity > holdings) return alert('Yetersiz Ons!');
        balance += total - commission;
        holdings -= quantity;
    }
    
    updateDisplay();
}

// Görsel Güncelleme
function updateDisplay() {
    document.getElementById('cashBalance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('portfolioValue').textContent = `$${(holdings * currentPrice).toFixed(2)}`;
    document.getElementById('currentPrice').textContent = `$${currentPrice.toFixed(2)}`;
}

// Grafik Güncelleme
function updateChart() {
    chart.data.datasets[0].data = priceHistory;
    chart.update();
}

// Sistem Başlatma
setInterval(updateMarket, 2000);
setInterval(generateNews, config.newsInterval);

// Tema Kontrolü
if(isDarkMode) document.body.setAttribute('data-theme', 'dark');
