function updateCrimeChart(neighborhoodName) {
    fetch('/crimedata') // Adjust this URL to your actual endpoint
        .then(response => response.json())
        .then(data => {
            // Filter data for the selected neighborhood
            const selectedData = data.find(feature => feature.properties.AREA_NAME === neighborhoodName);
            if (!selectedData) return; // Exit if no data found

            // Extract crime data for the selected neighborhood
            const crimeData = {
                Assault: selectedData.properties.ASSAULT_2023,
                AutoTheft: selectedData.properties.AUTOTHEFT_2023,
                BikeTheft: selectedData.properties.BIKETHEFT_2023,
                BreakEnter: selectedData.properties.BREAKENTER_2023,
                Homicide: selectedData.properties.HOMICIDE_2023,
                Robbery: selectedData.properties.ROBBERY_2023,
                Shooting: selectedData.properties.SHOOTING_2023,
                Theft_From_MotorVehicle: selectedData.properties.THEFTFROMMV_2023,
                theftOver: selectedData.properties.THEFTOVER_2023,
            };

            // Prepare data for the pie chart
            const chartData = {
                labels: Object.keys(crimeData),
                datasets: [{
                    label: 'Crime Counts',
                    data: Object.values(crimeData),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(199, 199, 199, 0.2)',
                        'rgba(83, 102, 255, 0.2)',
                        'rgba(40, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(159, 159, 159, 1)',
                        'rgba(83, 102, 255, 1)',
                        'rgba(40, 159, 64, 1)',
                    ],
                    borderWidth: 1
                }]
            };

            // Config object for the chart
            const config = {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Crime Types in ' + neighborhoodName + ' (2023)'
                        }
                    }
                    
                },
            };

            // Render the chart
            const crimeChartElement = document.getElementById('crimeChart').getContext('2d');
            if (window.crimeChartInstance) {
                window.crimeChartInstance.destroy(); // DELETE the existing chart instance if present
            }
            window.crimeChartInstance = new Chart(crimeChartElement, config); // Create a new chart instance
        });
}

// // Event listener for dropdown changes
// document.getElementById('Neighbourhood').addEventListener('change', function() {
//     updateCrimeChart(this.value);
// });

document.getElementById('Neighbourhood').addEventListener('change', function() {
    const neighborhoodName = this.value;
    updateCrimeChart(neighborhoodName); // Existing call to update the crime chart
    updateLineChart(neighborhoodName); // Existing call to update the line chart
    // NEW: Update population display for the selected neighborhood
    fetch('/crimedata') // Use the existing crime data endpoint
        .then(response => response.json())
        .then(data => {
            const selectedData = data.find(feature => feature.properties.AREA_NAME === neighborhoodName);
            if (!selectedData) return; // Exit if no data found
            // Assuming 'POPULATION_2023' is the property holding the population data
            const population = selectedData.properties.POPULATION_2023;
            const populationDisplay = document.getElementById('populationDisplay'); // Ensure you have this ID in your HTML
            if (populationDisplay) {
                populationDisplay.textContent = `Chosen Neighborhood Population: ${population}`;
                populationDisplay.style.fontSize = '48px'; // Display in big fonts as requested
                // population.style.color = "red"; 
            }
        });
});
// Charting the Crime Rate overtime as linechart (2015-2023)

// Function to update line chart based on selected neighborhood
function updateLineChart(neighborhoodName) {
    fetch('/crimedata')
        .then(response => response.json())
        .then(data => {
            const selectedNeighborhoodData = data.find(neighborhood => neighborhood.properties.AREA_NAME === neighborhoodName);
        

            const crimeTypes = ['ASSAULT', 'AUTOTHEFT', 'BIKETHEFT', 'BREAKENTER', 'HOMICIDE', 'ROBBERY', 'SHOOTING', 'THEFTFROMMV', 'THEFTOVER'];
            const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
            const crimeDataByType = {};

            crimeTypes.forEach(crimeType => {
                crimeDataByType[crimeType] = years.map(year => selectedNeighborhoodData.properties[`${crimeType}_RATE_${year}`]);
            });

            const crimeLineChartData = {
                labels: years,
                datasets: crimeTypes.map((crimeType, index) => ({
                    label: crimeType,
                    data: crimeDataByType[crimeType],
                
                    borderColor:[
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(159, 159, 159, 1)',
                        'rgba(83, 102, 255, 1)',
                        'rgba(40, 159, 64, 1)',
                    ],
                    borderWidth: 1.5,
                    fill: false
                }))
            };

            const lineChartOptions = {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Crime Types Trend in ${neighborhoodName} (2015-2023)`
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Crime Rate'
                        }
                    }
                }
            };

            const crimeLineChartElement = document.getElementById('crimeLineChart').getContext('2d');
            if (window.crimeLineChartInstance) {
                window.crimeLineChartInstance.destroy(); // DELETE the existing chart instance if present
            }
            window.crimeLineChartInstance = new Chart(crimeLineChartElement, {
                type: 'line',
                data: crimeLineChartData,
                options: lineChartOptions
            });
        });
}

// Event listener for dropdown changes
document.getElementById('Neighbourhood').addEventListener('change', function() {
    updateLineChart(this.value);
});










// Charting School Type data in Municipalities

// Function to fetch school count data and plot stacked bar graph
fetch('/schcountdata')
    .then(response => response.json())
    .then(jsonData => { // <-- Fix: jsonData should be passed to the callback
        // Extract the necessary data
        const municipalities = jsonData.map(item => item.Municipality);
        const schoolTypes = Object.keys(jsonData[0]).filter(key => key !== 'Municipality');
        const countsByType = schoolTypes.map(type => jsonData.map(item => item[type]));

        // Create the stacked bar graph
        const schChart = document.getElementById('stacked-bar-chart').getContext('2d');
        const stackedBarChart = new Chart(schChart, {
            type: 'bar',
            data: {
                labels: municipalities,
                datasets: schoolTypes.map((type, index) => ({
                    label: type,
                    data: countsByType[index],
                    backgroundColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
                    stack: 'Stack 1' // Ensure each dataset is stacked
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    });

// Function to fetch school count data and update the interactive bar graph
function updateSchoolChart(selectedMunicipality) {
    console.log("Updating graph for:", selectedMunicipality); // Debugging

    fetch('/schcountdata') // Adjust this URL to your actual endpoint
        .then(response => response.json())
        .then(data => {
            // Filter data for the selected municipality
            const selectedData = data.find(feature => feature.Municipality === selectedMunicipality);
            if (!selectedData) return; // Exit if no data found

            // Extract school count data for the selected municipality
            var xLabels = Object.keys(selectedData).filter(key => key !== "Municipality" && key !== "_id");
            //var counts = Object.values(selectedData).slice(1).map(value => parseInt(value)); // Extract counts
            var counts = xLabels.map(label => selectedData[label]); // Extract counts
            console.log("Selected data:", counts); // Debugging

            var data = [{
                x: xLabels,
                y: counts,
                type: 'bar'
            }];

            var layout = {
                title: 'School Type Bar Graph for ' + selectedMunicipality,
                xaxis: { title: 'School Type' },
                yaxis: { title: 'Count' }
            };

            // Clear the interactive-bar div before creating a new plot
            Plotly.purge('interactive-bar');

            Plotly.newPlot('interactive-bar', data, layout);
        });
}

// Event listener for dropdown selection change
document.getElementById('Municipality').addEventListener('change', function() {
    updateSchoolChart(this.value);
});

// Initial plot for default selected municipality
var defaultMunicipality = municipalities[0];
updateSchoolChart(defaultMunicipality);
