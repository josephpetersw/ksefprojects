/**
 * charts.js — Chart.js wrappers for Classroom AI
 */
const Charts = (() => {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';

  const FONT = "'Space Grotesk', sans-serif";
  const PALETTE = ['#10b981','#06b6d4','#3b82f6','#f59e0b','#f97316','#ef4444','#8b5cf6'];

  function behaviourDoughnut(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map(c => c + 'aa'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: { family: FONT, size: 12 },
              boxWidth: 12,
              padding: 16,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} detections`
            }
          }
        }
      }
    });
  }

  function engagementLine(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Attention %',
          data,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6,182,212,0.08)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#06b6d4',
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0, max: 100,
            ticks: { callback: v => v + '%' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: { grid: { color: 'rgba(255,255,255,0.04)' } }
        },
        plugins: {
          legend: { labels: { font: { family: FONT, size: 12 } } }
        }
      }
    });
  }

  function behaviourBar(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          ...d,
          backgroundColor: (PALETTE[i] || '#3b82f6') + 'bb',
          borderColor: PALETTE[i] || '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6,
        }))
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { labels: { font: { family: FONT, size: 12 } } }
        }
      }
    });
  }

  return { behaviourDoughnut, engagementLine, behaviourBar };
})();

window.Charts = Charts;
