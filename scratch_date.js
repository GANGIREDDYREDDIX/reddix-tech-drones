const range = '7d';
let chartData = [];
const today = new Date();

if (range === '7d') {
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    chartData.push({ name: dateKey, revenue: 0 });
  }
}
console.log(chartData);
