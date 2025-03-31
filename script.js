const config = {
    initialPrice: 2300.00,
    initialBalance: 100000,
    newsInterval: 15000,
    marketUpdateInterval: 1000,
};

let currentPrice = config.initialPrice;
let balance = config.initialBalance;
let holdings = 0;

function updateMarket() {
    let change = (Math.random() - 0.5) * 10;
    currentPrice = Math.max(1800, Math.min(2500, currentPrice + change));
    document.getElementById('currentPrice').innerText = `$${currentPrice.toFixed(2)}`;
    updatePortfolio();
}

function placeOrder(type) {
    let quantity = parseFloat(document.getElementById('quantity').value);
    if (type === 'buy') {
        let cost = quantity * currentPrice;
        if (cost <= balance) {
            balance -= cost;
            holdings += quantity;
        }
    } else if (type === 'sell') {
        if (quantity <= holdings) {
            let revenue = quantity * currentPrice;
            balance += revenue;
            holdings -= quantity;
        }
    }
    updatePortfolio();
}

function updatePortfolio() {
    document.getElementById('cashBalance').innerText = `Nakit: $${balance.toFixed(2)}`;
    document.getElementById('goldHoldings').innerText = `Altın: ${holdings.toFixed(2)} ons`;
    let totalValue = balance + holdings * currentPrice;
    document.getElementById('totalValue').innerText = `Toplam: $${totalValue.toFixed(2)}`;
}

const newsHeadlines = [
    "Altın fiyatları yükseliyor!", 
    "FED faiz kararını açıkladı", 
    "Piyasalarda belirsizlik artıyor", 
    "Çin ve ABD ticaret anlaşmazlığı derinleşti",
    "Petrol fiyatları altını etkiliyor!"
];

function generateNews() {
    let news = newsHeadlines[Math.floor(Math.random() * newsHeadlines.length)];
    let newsFeed = document.getElementById('newsFeed');
    let newsItem = document.createElement('div');
    newsItem.innerText = news;
    newsFeed.prepend(newsItem);
}

setInterval(updateMarket, config.marketUpdateInterval);
setInterval(generateNews, config.newsInterval);
