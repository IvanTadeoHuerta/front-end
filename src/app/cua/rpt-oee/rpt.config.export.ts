let configChart = {
    chart: {
        type: 'column',
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                [0, 'rgb(96, 96, 96)'],
                [1, 'rgb(16, 16, 16)']
            ]
        },
        borderWidth: 0,
        borderRadius: 0,
        plotBackgroundColor: null,
        plotShadow: false,
        plotBorderWidth: 0,
        options3d: {
            enabled: true,
            alpha: 10,
            beta: 2,
            depth: 95
        }
    },
    credits: {
        enabled: false
    },
    title: {
        text: '',
        style: {
            color: '#ffffff'
        }
    },
    subtitle: {
        text: '',
        style: {
            color: '#ffffff'
        }
    },
    xAxis: {
        categories: [],
        labels: {
            style: {
                color: '#ffffff'
            }
        }
    },
    yAxis: {
        title: {
            text: ''
        },
        labels: {
            style: {
                color: '#ffffff',
            },
            formatter: function () {
                return this.value + ' %';
            }
        }

    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                color: '#FFFFFF',
                inside: false,
                y: 10,
                distance: -10
            },
            events: {
                legendItemClick: function () {
                    return false;
                }
            }
        },
        bar: {
            depth: 75
        }
    },
    colors: ['#388e3c', '#4fc3f7'],
    series: [],
};



export {
    configChart
}