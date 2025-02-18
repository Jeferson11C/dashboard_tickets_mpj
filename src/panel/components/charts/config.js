export const basicOptions = {
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: "#f5f5f5",
            titleColor: "#333",
            bodyColor: "#666",
            bodySpacing: 4,
            padding: 12,
            mode: "nearest",
            intersect: false,
            position: "nearest",
        },
    },
    responsive: true,
};

export let blueChartOptions = {
    ...basicOptions,
    scales: {
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: "rgba(29,140,248,0.0)",
                zeroLineColor: "transparent",
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 125,
                padding: 20,
                color: "#2380f7",
            },
        },
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: "rgba(29,140,248,0.1)",
                zeroLineColor: "transparent",
            },
            ticks: {
                padding: 20,
                color: "#2380f7",
            },
        },
    },
};

export let purpleChartOptions = {
    ...blueChartOptions,
    scales: {
        y: { ticks: { color: "#9a9a9a" } },
        x: { ticks: { color: "#9a9a9a" } },
    },
};

export let orangeChartOptions = {
    ...blueChartOptions,
    scales: {
        y: { ticks: { suggestedMin: 50, suggestedMax: 110, color: "#ff8a76" } },
        x: { ticks: { color: "#ff8a76" } },
    },
};

export let greenChartOptions = {
    ...blueChartOptions,
    scales: {
        y: { ticks: { suggestedMin: 50, suggestedMax: 125, color: "#9e9e9e" } },
        x: { ticks: { color: "#9e9e9e" } },
    },
};

export let barChartOptions = {
    ...blueChartOptions,
    scales: {
        y: {
            grid: { color: "rgba(29,140,248,0.1)" },
            ticks: { suggestedMin: 60, suggestedMax: 120, color: "#9e9e9e" },
        },
        x: {
            grid: { color: "rgba(29,140,248,0.1)" },
            ticks: { color: "#9e9e9e" },
        },
    },
};
