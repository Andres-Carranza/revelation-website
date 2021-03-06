
async function chartData() {
    const ctx = document.getElementById('tsa').getContext('2d');
    const data = await getData();
    var aspectRatio = 1/.3
    if (screen.width <= 500)
        aspectRatio = 1/.79 
    else if (screen.width <= 700)
        aspectRatio = 1/.7
    else if (screen.width <= 1000)
        aspectRatio = 1/.5


    const myChart = new Chart(ctx, {
        data: {
            labels: data['Dates'],
            datasets: [
                {
                    label: 'Passengers',
                    data: data['2020'],
                    fill: false,
                    yAxisID: "left",
                    borderColor: 'navy',
                    backgroundColor: 'navy',
                    borderWidth: 2,
                    pointRadius: 0,
                    hitRadius:0,
                    type: 'line'
              },
              {
                  label: '7 day moving average % change from 2019',
                  data: data['change'],
                  fill: false,
                  yAxisID: "right",
                  borderColor: '#58b7cc',
                  backgroundColor: '#58b7cc',
                  borderWidth: 2,
                  pointRadius: 0,
                  hitRadius:0,
                  type: 'line'
            }
            ]
        },
        options: {
            aspectRatio: aspectRatio,
            onResize: function(chart, size){
                if( screen.width <= 500){
                    chart.aspectRatio= 1/.9;
                }
                else if( screen.width <= 700){
                    chart.aspectRatio= 1/.7;
                }
                else if( screen.width <= 1000){
                    chart.aspectRatio= 1/.5;
                }
                else {
                    chart.aspectRatio= 1/.3;
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                      unit: 'month'
                    }
                }],
                yAxes: [{
                  position: "left",
                  id: "left",
                  
                  scaleLabel: {
                      display: true,
                      labelString:'Passengers (thousands)'
                  },
                  ticks: {
                      beginAtZero: true,
                  }
                }, {
                  position: "right",
                  id: "right",
                  gridLines: false,
                  scaleLabel: {
                      display: true,
                      labelString:'% Change'
                  },
                  ticks: {
                    beginAtZero: true,
                      callback: function(value, index, values) {
                          return value + "%";
                      }
                  }
                }]
            },
            tooltips: {
                intersect: false,
                callbacks: {
                      label: function(tooltipItem, data) {
                        var value = tooltipItem.value;
                        value = Math.round((parseFloat(value)) * 100) / 100;

                        if (tooltipItem.datasetIndex == 0){
                            if(parseInt(value) >= 1000)
                                value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                        else{
                            value = value +'%'
                        }
                        return  value
                      },
                      title: function(tooltipItem, data){
                          var date = tooltipItem[0].xLabel.split('-')
                        
                          if (date[1][0] == '0')
                                date[1] = date[1].charAt(1)
                          if( date[2][0] == '0')
                            date[2] = date[2].charAt(1)
                          return date[1] +'/'+date[2]+'/'+date[0]
                      }
                } 
            },
            legend: {
                 position: 'bottom',
                 onClick: (e) => e.stopPropagation()
            }
        }
    });
}

function calcMAA(values) {
    means = [NaN,NaN, NaN]
    for(var i = 3; i<= values.length - 3 ;i++){
        var sum = 0;
        for(var j = -3; j<=3; j++){
            sum+=values[i+j]
        }
        means.push(sum/7);
    }
    means.push(NaN)
    means.push(NaN)
    means.push(NaN)
    return means;
  }

async function getData(){
    const response= await fetch('scripts/scrapers/tsa_scraper/tsa-data.csv')
    const raw_data = await response.text()
    
    const csv_data = d3.csvParse(raw_data)
    
    const data = {'Dates': [],'2020': [], '2019': [], 'change': []};

    const threshold = 0

    csv_data.forEach(function (row, index) {
        if( index >= threshold) {
            date = row['Date'].split('/')

            if (date[0].length ==1 )
                date[0] = '0'+date[0]
            if (date[1].length ==1 )
                date[1] = '0'+date[1]

            data['Dates'].push(date[2] +'-'+date[0]+'-'+date[1])
            data['2020'].push(row['2020']/1000)
            data['2019'].push(row['2019']/1000)
        }
    })

    var ma20 = calcMAA(data['2020'], 7 ) 
    var ma19 = calcMAA(data['2019'], 7 )
    //console.log(ma20) 
    ma20.forEach(function (row, index){
        data['change'].push(( (ma20[index] / ma19[index]) - 1) * 100)
    })

    return data
}

chartData()