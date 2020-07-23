
async function chartData() {
    const ctx = document.getElementById('unemployment-claims').getContext('2d');
    const data = await getData();

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: '# Jobless Claims',
                    data: data['claims'],
                    fill: false,
                    borderColor: 'orange',
                    backgroundColor: 'orange',
                    borderWidth: 2,
                    pointRadius: 0
              }
            ]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        maxTicksLimit: 10
                    },
                    gridLines: {
                      display: false
                    }
                }],
                
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Jobless Claims (millions)'
                    },
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 7
                    }
                }]
            },
            tooltips: {
                intersect: false,
                callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[0].data[tooltipItem.index];
                          value = Math.round((parseFloat(value)) * 100) / 100;
                          if(parseInt(value) >= 1000){
                                     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                  } else {
                                     return value;
                                  }
                      }
                } 
            },
            legend: {
                position: 'bottom'
            }
        }
    });
}

async function getData(){
    const response= await fetch('scripts/scrapers/claims_scraper/claims-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'claims': []};

    const threshold = csv_data.length  - 60

    csv_data.forEach(function (row, index) {
        if( index >= threshold) {
            date = row['date'].split('/')
            data['Dates'].push(date[0] +'/' + date[1])
            data['claims'].push(row['claims']/1000000)
        }
    })
    return data
}

chartData()