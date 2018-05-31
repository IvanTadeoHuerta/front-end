let configChart = {
    chart: {
        type: 'column',
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
                [0, 'rgb(124,179,66)'],
                [1, 'rgb(51,105,30)']
            ]
        }
    },
    credits: {
        enabled: false
    },
    title: {
        text: '',
        style: {
            color: '#fff'
        }
    },
    subtitle: {
        text: '',
        style: {
            color: '#fff'
        }
    },
    xAxis: {
        categories: [],
        labels: {
            style: {
                color: '#fff'
            }
        }
    },
    yAxis: {
        title: {
            text: ' Producción ',
            style: {
                color: '#FFFFFF'
            }
        },
        labels: {
            style: {
                color: '#fff',
            },
            formatter: function () {
                return this.value + 'T';
            }
        },
        gridLineWidth: 0.1,
        gridLineColor: '#e0f2f1',
        gridLineDashStyle: 'longdash'
    },
    legend: {
        itemStyle: {
            color: '#FFFFFF'
        }
    },
    plotOptions: {
        series: {
            events: {
                legendItemClick: function () {
                    return false;
                }
            }
        },
        column: {
            dataLabels: {
                enabled: true,
                color: '#000000',
                inside: true,
                rotation: 0
            }
        },
        line: {
            marker: {
                enabled: false
            }
        }
    },
    tooltip: {
        headerFormat: ''
    },
    series: [],
};

let configChartSpider = {

    chart: {
        polar: true,
        type: 'line'
    },

    title: {
        text: '',
        style: {
            color: '#33691E'
        }
    },
    credits: {
        enabled: false
    },
    pane: {
        size: '100%'
    },

    xAxis: {
        categories: ['GRUPO A', 'GRUPO B', 'GRUPO C', 'GRUPO D'],
        tickmarkPlacement: 'on',
        lineWidth: 0,
        labels: {
            style: {
                color: '#33691E',
                fontWeight: 'bold'
            }
        }
    },

    yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,

        labels: {
            style: {
                color: '#33691E',
            },
            formatter: function () {
                return '';
            }
        }
    },

    tooltip: {
        shared: true,
        pointFormat: '<span>{series.name}: <b>{point.y}</b><br/>'
    },

    legend: {
        itemStyle: {
            color: '#33691E'
        },
        visible: false
    },

    plotOptions: {
        series: {

            dataLabels: {
                overflow: 'none',
                allowOverlap: true,
                enabled: true,
                x: 0,
                y: -6
            },

            events: {
                legendItemClick: function () {
                    return false;
                }
            }
        }
    },

    series: []

};



export {
    configChart,
    configChartSpider
}