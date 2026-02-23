// ============================================================
// DADOS SIMULADOS - 12 MESES (Mar 2025 - Fev 2026)
// ============================================================
const monthLabels = [
    'Mar/25', 'Abr/25', 'Mai/25', 'Jun/25', 'Jul/25', 'Ago/25',
    'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26'
];

const dashboardData = {
    receita:      [182000, 175000, 190000, 198000, 185000, 201000, 210000, 215000, 230000, 260000, 195000, 220000],
    custos:       [118000, 115000, 121000, 125000, 119000, 126000, 130000, 132000, 140000, 155000, 125000, 135000],
    lucro:        [],
    margem:       [],
    ticketMedio:  [145, 138, 152, 158, 148, 160, 165, 170, 178, 195, 155, 172],
    clientes:     [1255, 1268, 1250, 1253, 1250, 1256, 1273, 1265, 1292, 1333, 1258, 1279],
};

// Calculate derived metrics
dashboardData.receita.forEach(function(r, i) {
    var c = dashboardData.custos[i];
    dashboardData.lucro.push(r - c);
    dashboardData.margem.push(parseFloat(((r - c) / r * 100).toFixed(1)));
});

// Cost breakdown for doughnut chart
var costBreakdown = {
    labels: ['Pessoal', 'Operacional', 'Marketing', 'Infraestrutura', 'Outros'],
    values: [45, 22, 15, 12, 6]
};

// KPI definitions with targets
var kpis = [
    { id: 'receita', label: 'Receita Total', format: 'currency', meta: 210000, data: dashboardData.receita },
    { id: 'custos', label: 'Custos Operacionais', format: 'currency', meta: 130000, data: dashboardData.custos, invertAlert: true },
    { id: 'lucro', label: 'Lucro L\u00edquido', format: 'currency', meta: 80000, data: dashboardData.lucro },
    { id: 'margem', label: 'Margem de Lucro', format: 'percent', meta: 38, data: dashboardData.margem },
    { id: 'ticketMedio', label: 'Ticket M\u00e9dio', format: 'currency', meta: 160, data: dashboardData.ticketMedio },
    { id: 'clientes', label: 'N\u00ba de Clientes', format: 'number', meta: 1270, data: dashboardData.clientes }
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function formatCurrency(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function formatNumber(value) {
    return value.toLocaleString('pt-BR');
}

function formatPercent(value) {
    return value.toFixed(1) + '%';
}

function formatValue(value, format) {
    if (format === 'currency') return formatCurrency(value);
    if (format === 'percent') return formatPercent(value);
    if (format === 'number') return formatNumber(value);
    return String(value);
}

function calcVariation(current, previous) {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
}

// Safe element creation helper
function createEl(tag, className, textContent) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent !== undefined) el.textContent = textContent;
    return el;
}

// ============================================================
// KPI CARDS RENDERING (safe DOM methods)
// ============================================================
function renderKPIs(months) {
    var container = document.getElementById('kpiCards');
    container.textContent = '';

    kpis.forEach(function(kpi) {
        var slicedData = kpi.data.slice(-months);
        var current = slicedData[slicedData.length - 1];
        var previous = slicedData.length >= 2 ? slicedData[slicedData.length - 2] : slicedData[0];
        var variation = calcVariation(current, previous);

        var isPositive;
        if (kpi.invertAlert) {
            isPositive = variation !== null && variation <= 0;
        } else {
            isPositive = variation !== null && variation >= 0;
        }

        var metaStatus;
        if (kpi.invertAlert) {
            metaStatus = current <= kpi.meta ? 'above' : 'below';
        } else {
            metaStatus = current >= kpi.meta ? 'above' : 'below';
        }

        // Build card using safe DOM methods
        var card = createEl('div', 'kpi-card');

        // Header (label only, no emoji)
        var header = createEl('div', 'kpi-header');
        header.appendChild(createEl('span', 'kpi-label', kpi.label));
        card.appendChild(header);

        // Value
        card.appendChild(createEl('div', 'kpi-value', formatValue(current, kpi.format)));

        // Footer
        var footer = createEl('div', 'kpi-footer');
        var variationEl = createEl('span', 'kpi-variation ' + (isPositive ? 'positive' : 'negative'));
        var arrow = isPositive ? '\u25B2' : '\u25BC';
        var varText = variation !== null ? Math.abs(variation).toFixed(1) + '%' : 'N/A';
        variationEl.textContent = arrow + ' ' + varText;
        footer.appendChild(variationEl);

        var metaEl = createEl('span', 'kpi-meta ' + metaStatus);
        metaEl.textContent = 'Meta: ' + formatValue(kpi.meta, kpi.format);
        footer.appendChild(metaEl);
        card.appendChild(footer);

        // Meta bar
        var metaBar = createEl('div', 'kpi-meta-bar');
        var metaFill = createEl('div', 'meta-bar-fill ' + metaStatus);
        var fillPercent = Math.min((current / kpi.meta) * 100, 100);
        metaFill.style.width = fillPercent + '%';
        metaBar.appendChild(metaFill);
        card.appendChild(metaBar);

        container.appendChild(card);
    });
}

// ============================================================
// CHART CONFIGURATIONS
// ============================================================
var chartColors = {
    primary: '#6366f1',
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    secondary: '#f43f5e',
    secondaryLight: 'rgba(244, 63, 94, 0.15)',
    success: '#10b981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#f59e0b',
    info: '#3b82f6',
    grid: 'rgba(255, 255, 255, 0.06)',
    text: 'rgba(255, 255, 255, 0.65)',
    textBright: 'rgba(255, 255, 255, 0.9)'
};

var isMobile = window.innerWidth <= 480;

var defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: chartColors.text,
                font: { family: 'Inter', size: isMobile ? 10 : 12 },
                padding: isMobile ? 10 : 20,
                usePointStyle: true,
                pointStyleWidth: isMobile ? 8 : 10
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 15, 30, 0.95)',
            titleColor: chartColors.textBright,
            bodyColor: chartColors.text,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            displayColors: true
        }
    },
    scales: {
        x: {
            grid: { color: chartColors.grid },
            ticks: { color: chartColors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 }, maxRotation: isMobile ? 45 : 0 }
        },
        y: {
            grid: { color: chartColors.grid },
            ticks: { color: chartColors.text, font: { family: 'Inter', size: isMobile ? 9 : 11 } }
        }
    }
};

var charts = {};

function createRevenueChart(months) {
    var ctx = document.getElementById('revenueChart').getContext('2d');
    var labels = monthLabels.slice(-months);
    var receita = dashboardData.receita.slice(-months);
    var custos = dashboardData.custos.slice(-months);
    var lucro = dashboardData.lucro.slice(-months);

    if (charts.revenue) charts.revenue.destroy();

    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receita',
                    data: receita,
                    borderColor: chartColors.primary,
                    backgroundColor: chartColors.primaryLight,
                    fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2.5
                },
                {
                    label: 'Custos',
                    data: custos,
                    borderColor: chartColors.secondary,
                    backgroundColor: chartColors.secondaryLight,
                    fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2.5
                },
                {
                    label: 'Lucro',
                    data: lucro,
                    borderColor: chartColors.success,
                    backgroundColor: chartColors.successLight,
                    fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2.5
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: defaultOptions.plugins.legend,
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.95)',
                    titleColor: chartColors.textBright,
                    bodyColor: chartColors.text,
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1, cornerRadius: 8, padding: 12,
                    callbacks: {
                        label: function(ctx) { return ctx.dataset.label + ': ' + formatCurrency(ctx.parsed.y); }
                    }
                }
            },
            scales: {
                x: defaultOptions.scales.x,
                y: {
                    grid: { color: chartColors.grid },
                    ticks: {
                        color: chartColors.text,
                        font: { family: 'Inter', size: 11 },
                        callback: function(v) { return 'R$ ' + (v / 1000) + 'k'; }
                    }
                }
            }
        }
    });
}

function createMarginChart(months) {
    var ctx = document.getElementById('marginChart').getContext('2d');
    var labels = monthLabels.slice(-months);
    var margem = dashboardData.margem.slice(-months);

    if (charts.margin) charts.margin.destroy();

    var movingAvg = margem.map(function(_, i, arr) {
        var start = Math.max(0, i - 2);
        var slice = arr.slice(start, i + 1);
        return parseFloat((slice.reduce(function(a, b) { return a + b; }, 0) / slice.length).toFixed(1));
    });

    charts.margin = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Margem de Lucro',
                    data: margem,
                    backgroundColor: margem.map(function(v) { return v >= 38 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(244, 63, 94, 0.7)'; }),
                    borderColor: margem.map(function(v) { return v >= 38 ? '#10b981' : '#f43f5e'; }),
                    borderWidth: 1.5, borderRadius: 6, barPercentage: 0.6
                },
                {
                    label: 'M\u00e9dia M\u00f3vel (3m)',
                    data: movingAvg,
                    type: 'line',
                    borderColor: chartColors.warning,
                    backgroundColor: 'transparent',
                    tension: 0.4, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2, borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: defaultOptions.plugins.legend,
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.95)',
                    titleColor: chartColors.textBright, bodyColor: chartColors.text,
                    borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, cornerRadius: 8, padding: 12,
                    callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + '%'; } }
                }
            },
            scales: {
                x: defaultOptions.scales.x,
                y: {
                    grid: { color: chartColors.grid },
                    ticks: { color: chartColors.text, font: { family: 'Inter', size: 11 }, callback: function(v) { return v + '%'; } },
                    min: 30, max: 45
                }
            }
        }
    });
}

function createVariationChart(months) {
    var ctx = document.getElementById('variationChart').getContext('2d');
    var labels = monthLabels.slice(-months);

    var receitaVar = dashboardData.receita.slice(-months).map(function(v, i, arr) {
        return i === 0 ? 0 : parseFloat(calcVariation(v, arr[i - 1]).toFixed(1));
    });
    var lucroVar = dashboardData.lucro.slice(-months).map(function(v, i, arr) {
        return i === 0 ? 0 : parseFloat(calcVariation(v, arr[i - 1]).toFixed(1));
    });
    var clientesVar = dashboardData.clientes.slice(-months).map(function(v, i, arr) {
        return i === 0 ? 0 : parseFloat(calcVariation(v, arr[i - 1]).toFixed(1));
    });

    if (charts.variation) charts.variation.destroy();

    charts.variation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Receita V%', data: receitaVar, backgroundColor: 'rgba(99, 102, 241, 0.7)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7 },
                { label: 'Lucro V%', data: lucroVar, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: '#10b981', borderWidth: 1, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7 },
                { label: 'Clientes V%', data: clientesVar, backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: defaultOptions.plugins.legend,
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.95)',
                    titleColor: chartColors.textBright, bodyColor: chartColors.text,
                    borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, cornerRadius: 8, padding: 12,
                    callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + (ctx.parsed.y > 0 ? '+' : '') + ctx.parsed.y + '%'; } }
                }
            },
            scales: {
                x: defaultOptions.scales.x,
                y: {
                    grid: { color: chartColors.grid },
                    ticks: { color: chartColors.text, font: { family: 'Inter', size: 11 }, callback: function(v) { return (v > 0 ? '+' : '') + v + '%'; } }
                }
            }
        }
    });
}

function createCostsChart() {
    var ctx = document.getElementById('costsChart').getContext('2d');
    if (charts.costs) charts.costs.destroy();

    var colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

    charts.costs = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: costBreakdown.labels,
            datasets: [{
                data: costBreakdown.values,
                backgroundColor: colors.map(function(c) { return c + 'cc'; }),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '65%',
            plugins: {
                legend: {
                    position: isMobile ? 'bottom' : 'right',
                    labels: { color: chartColors.text, font: { family: 'Inter', size: isMobile ? 10 : 12 }, padding: isMobile ? 10 : 16, usePointStyle: true, pointStyleWidth: isMobile ? 8 : 10 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 30, 0.95)',
                    titleColor: chartColors.textBright, bodyColor: chartColors.text,
                    borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, cornerRadius: 8, padding: 12,
                    callbacks: { label: function(ctx) { return ctx.label + ': ' + ctx.parsed + '%'; } }
                }
            }
        }
    });
}

// ============================================================
// DATA TABLE RENDERING (safe DOM methods)
// ============================================================
function renderTable(months) {
    var tbody = document.getElementById('tableBody');
    tbody.textContent = '';

    var labels = monthLabels.slice(-months);
    var receita = dashboardData.receita.slice(-months);
    var custos = dashboardData.custos.slice(-months);
    var lucro = dashboardData.lucro.slice(-months);
    var margem = dashboardData.margem.slice(-months);
    var ticket = dashboardData.ticketMedio.slice(-months);
    var clientes = dashboardData.clientes.slice(-months);

    labels.forEach(function(label, i) {
        var row = document.createElement('tr');

        var tdMonth = document.createElement('td');
        var strong = document.createElement('strong');
        strong.textContent = label;
        tdMonth.appendChild(strong);
        row.appendChild(tdMonth);

        var tdReceita = document.createElement('td');
        tdReceita.textContent = formatCurrency(receita[i]);
        row.appendChild(tdReceita);

        var tdCustos = document.createElement('td');
        tdCustos.textContent = formatCurrency(custos[i]);
        row.appendChild(tdCustos);

        var tdLucro = document.createElement('td');
        tdLucro.textContent = formatCurrency(lucro[i]);
        tdLucro.className = lucro[i] >= 80000 ? 'text-green' : 'text-red';
        row.appendChild(tdLucro);

        var tdMargem = document.createElement('td');
        tdMargem.textContent = margem[i] + '%';
        tdMargem.className = margem[i] >= 38 ? 'text-green' : 'text-red';
        row.appendChild(tdMargem);

        var tdTicket = document.createElement('td');
        tdTicket.textContent = formatCurrency(ticket[i]);
        row.appendChild(tdTicket);

        var tdClientes = document.createElement('td');
        tdClientes.textContent = formatNumber(clientes[i]);
        row.appendChild(tdClientes);

        tbody.appendChild(row);
    });
}

// ============================================================
// DASHBOARD INITIALIZATION & CONTROLS
// ============================================================
var currentMonths = 12;

function updateDashboard(months) {
    currentMonths = months;
    renderKPIs(months);
    createRevenueChart(months);
    createMarginChart(months);
    createVariationChart(months);
    createCostsChart();
    renderTable(months);
}

// Period filter
document.getElementById('periodFilter').addEventListener('change', function() {
    updateDashboard(parseInt(this.value));
});

// View toggle (Cards vs Table)
document.querySelectorAll('.view-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.view-btn').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        var view = this.dataset.view;
        var kpiCards = document.getElementById('kpiCards');
        var dataTable = document.getElementById('dataTable');

        if (view === 'cards') {
            kpiCards.style.display = '';
            dataTable.style.display = 'none';
        } else {
            kpiCards.style.display = 'none';
            dataTable.style.display = '';
        }
    });
});

// ============================================================
// NAVIGATION
// ============================================================
var navbar = document.getElementById('navbar');
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
var observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.test-card, .objective-item, .improvement-item, .team-card, .kpi-card, .chart-container, .validation-card').forEach(function(el) {
    el.classList.add('animate-in');
    observer.observe(el);
});

// ============================================================
// RESPONSIVE CHART REBUILD ON RESIZE
// ============================================================
var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        var newMobile = window.innerWidth <= 480;
        if (newMobile !== isMobile) {
            isMobile = newMobile;
            // Rebuild default options with new sizes
            defaultOptions.plugins.legend.labels.font.size = isMobile ? 10 : 12;
            defaultOptions.plugins.legend.labels.padding = isMobile ? 10 : 20;
            defaultOptions.plugins.legend.labels.pointStyleWidth = isMobile ? 8 : 10;
            defaultOptions.scales.x.ticks.font.size = isMobile ? 9 : 11;
            defaultOptions.scales.x.ticks.maxRotation = isMobile ? 45 : 0;
            defaultOptions.scales.y.ticks.font.size = isMobile ? 9 : 11;
            updateDashboard(currentMonths);
        }
    }, 250);
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard(12);
});
