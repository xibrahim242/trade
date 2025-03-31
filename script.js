// Sistem Konfigürasyonu
const config = {
    initialPrice: 2300.00,
    initialBalance: 100000,
    volatility: 0.03,
    newsInterval: 4000,
    commission: 0.001,
    maxHistory: 50
};

// Sistem Değişkenleri
let currentPrice = config.initialPrice;
let balance = config.initialBalance;
let holdings = 0;
let priceHistory = Array(config.maxHistory).fill(config.initialPrice);
let isDarkMode = false;

// Grafik Başlatma
const ctx = document.getElementById('priceChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: priceHistory.map((_,i) => i+1),
        datasets: [{
            label: 'XAU/USD Fiyat',
            data: priceHistory,
            borderColor: 'var(--chart-color)',
            tension: 0.1,
            pointRadius: 0
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
                displayColors: false
            }
        },
        scales: {
            x: { display: false },
            y: {
                beginAtZero: false,
                grace: '5%',
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: {
                    color: 'var(--primary-text)',
                    callback: value => '$' + value.toFixed(2),
                    maxTicksLimit: 5
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
    if(priceHistory.length > config.maxHistory) priceHistory.shift();
    
    updateChart();
    updateDisplay();
}

// Haber Sistemi
const newsData = [
    { msg: "FED Faiz Artışı %0.75", impact: -0.05 },
    { msg: "Orta Doğu'da Savaş Riski", impact: 0.08 },
    { msg: "Enflasyon Beklentiyi Aştı", impact: 0.06 },
    { msg: "Altın Üretimi Düştü", impact: 0.04 },
    { msg: "Dolar Endeksi Yükseldi", impact: -0.07 },
    { msg: "Merkez Bankası Altın Aldı", impact: 0.05 },
    { msg: "Yeni Maden Yasası", impact: -0.03 },
    { msg: "Küresel Resesyon Endişesi", impact: 0.09 }
];

function generateNews() {
    const news = newsData[Math.floor(Math.random() * newsData.length)];
    const impactValue = currentPrice * news.impact;
    currentPrice = parseFloat((currentPrice + impactValue).toFixed(2));
    
    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.style.borderLeftColor = news.impact > 0 ? '#27ae60' : '#e74c3c';
    newsElement.innerHTML = `
        <div><strong>${news.msg}</strong></div>
        <div>${news.impact > 0 ? '↑' : '↓'} $${Math.abs(impactValue.toFixed(2))}</div>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    const newsFeed = document.getElementById('newsFeed');
    newsFeed.prepend(newsElement);
    if(newsFeed.children.length > 8) newsFeed.lastChild.remove();
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
    const cost = quantity * currentPrice;
    const commission = cost * config.commission;
    
    if(type === 'buy') {
        if(cost + commission > balance) return alert('Yetersiz Bakiye!');
        balance -= (cost + commission);
        holdings += quantity;
    } else {
        if(holdings < quantity) return alert('Yetersiz Ons!');
        balance += (cost - commission);
        holdings -= quantity;
    }
    
    addTransaction(type, quantity, cost);
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
    document.querySelector('.current-price').textContent = `$${currentPrice.toFixed(2)}`;
    document.querySelector('.portfolio-value').textContent = `$${(holdings * currentPrice).toFixed(2)}`;
}

function updateChart() {
    chart.data.datasets[0].data = priceHistory;
    chart.update();
}

// Sistem Başlatma
setInterval(updateMarket, 2000);
setInterval(generateNews, config.newsInterval);

// Tema Kontrolü
if(localStorage.getItem('theme') === 'dark') toggleTheme();