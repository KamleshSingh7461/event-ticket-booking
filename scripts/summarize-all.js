
const fs = require('fs');

function summarizeAll() {
    const content = fs.readFileSync('ticket.txt', 'utf8');
    const lines = content.split('\n');
    const header = lines[0].split('\t');
    
    const productInfoIdx = header.indexOf('productinfo');
    const statusIdx = header.indexOf('status');
    const amountIdx = header.indexOf('amount');
    const firstnameIdx = header.indexOf('firstname');

    let total = 0;
    const products = {};

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length < header.length) continue;

        const status = cols[statusIdx] || '';
        const amount = parseFloat(cols[amountIdx]);
        const product = cols[productInfoIdx] || 'Unknown';

        if (status === 'captured') {
            total += amount;
            products[product] = (products[product] || 0) + amount;
        }
    }

    console.log('Total Captured Revenue:', total.toFixed(2));
    console.log('Products:', products);
}

summarizeAll();
