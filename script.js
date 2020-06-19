
function country_input_protocol() {
  console.log("hello")
  var country_input = document.getElementById("country").value
  var api_link;
  if (country_input.length == 0) {
    country_input = "Global"
  } else {
    var country_slug = country_slug_map.get(country_input);
    //api_link = 'https://covidtracking.com/api/us/daily';
    api_link = 'https://api.covid19api.com/total/dayone/country/' + country_slug + '/status/confirmed'
  }

  //=======Setting Feild Values Based off Input:=======//

  console.log(countries_set.size)
  for (let item of countries_set) {
    if (item.name == country_input) {
      document.getElementById("total-deaths").innerHTML = "Total Deaths: " + (item.total_deaths).toString();
      document.getElementById("total-cases").innerHTML = "Total Cases: " + (item.total_cases).toString();
      document.getElementById("total-recovered").innerHTML = "Total Recovered: " + (item.total_recovered).toString();
      document.getElementById("new-deaths").innerHTML = "New Deaths: " + (item.new_deaths).toString();
      document.getElementById("new-cases").innerHTML = "New Cases: " + (item.new_cases).toString();
      document.getElementById("new-recovered").innerHTML = "New Recovered: " + (item.new_recovered).toString();
      document.getElementById("information-header").innerHTML = "Statistics: " + (item.name);
      infected_population = item.total_cases;
      recovered_population = item.total_recovered;
      deaths = item.total_deaths;
    }
  }

  if (country_input == "Global") {
    pi_chart_protocol();
    return;
  }

  
  /////////////////////////////////////////////
  /// Request API Connection - COVID-19 API ///
  /////////////////////////////////////////////
  //fetch(api_link).then(response =>response.json()).then()
  var request_covid = new XMLHttpRequest();
  request_covid.open('GET', api_link, true)

  request_covid.onload = function() {

    // Parsing API response JSON File:
    var data = JSON.parse(this.response);
    cases_date_map.clear();
    for (let item of data) {
      cases_date_map.set(item.Date, item.Cases);
    }
    line_chart_prootocol();
  }

  // Send request
  request_covid.send();


  ////////////////////////////////////////////////
  /// Request API Connection - Census Pop. API ///
  ////////////////////////////////////////////////
  var request_pop = new XMLHttpRequest();

  request_pop.open('GET', 'https://api.census.gov/data/2019/pep/population?get=POP&for=us:*&key=b9bdee4252ff698f2fc93b55a5bab3f73d483050', true);
  request_pop.onload = function() {
    var data = JSON.parse(this.response);
    US_pop = data[1][0];
    pi_chart_protocol();
  } 

  // Send request
  request_pop.send();

}


function pi_chart_protocol() {
  var pop_data = [ 
    infected_population, 
    recovered_population, 
    deaths];

  console.log(pop_data);
  //Delete Current Chart Data:
  pi_graph.data.datasets.forEach((dataset) => {
    dataset.data.length = 0;
  });


  //Insert New Chart Information:
  for (let item of pop_data) {
    pi_graph.data.datasets[0].data.push(item);
  }

  pi_graph.reset();
  pi_graph.update( {
    duration: 1000,
    easing: 'easeOutQuart'
  }

  );

}



function line_chart_prootocol() {
  //Get Data:
  var dates = []
  var cases = []
  var index = 0;
  for (let item of cases_date_map) {
    index++;
    if (index % 7 == 0) {
      dates.push((item[0].split("T")[0]));
      cases.push(item[1]);
    }
  }
 

  //Delete Current Chart Information:
  line_graph.data.labels.pop();
  line_graph.data.datasets.forEach((dataset) => {
      dataset.data.length = 0;
  });


  


  //Insert New Chart Information:
  line_graph.data.labels = dates;
  for (let case_data of cases) {
    line_graph.data.datasets[0].data.push(case_data);
  }
  line_graph.reset();
  line_graph.update( {
    duration: 800,
    easing: 'easeOutQuart'
  }
  );
  
}





function fill_country_information() {
  //////////////////////////////
  /// Request API Connection ///
  //////////////////////////////
  var counrty_searchables = document.getElementById('countries');
  var searchable_options = [];
  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.covid19api.com/summary', true)
  request.onload = function() {
    // Parsing API response JSON File:
    var data = JSON.parse(this.response);
    countries_set.add(       
      new Country(
        data.Global.TotalDeaths, data.Global.NewDeaths, 
        data.Global.TotalRecovered, data.Global.NewRecovered, 
        data.Global.TotalConfirmed, data.Global.NewConfirmed, 
        "Global")); 
        searchable_options.push('Global');


    for (let a_country of data["Countries"]) {
       //map of all countries and slugs:
      country_slug_map.set(a_country.Country, a_country.Slug);
      countries_set.add(
        new Country(
        a_country.TotalDeaths, a_country.NewDeaths, 
        a_country.TotalRecovered, a_country.NewRecovered, 
        a_country.TotalConfirmed, a_country.NewConfirmed, 
        a_country.Country));
      searchable_options.push(a_country.Country);
    }
    
    var options = '';
    //Now Populate Options for Countries:
    for (let name of searchable_options) {
      options += '<option value="'+name+'" />';
    }
    counrty_searchables.innerHTML = options;
    country_input_protocol();
  }


  // Send request
  request.send();
}



/*********************************/
////////// Main Function //////////
/*********************************/
function main() {

  fill_country_information();
  //country_input_protocol();
  //province_input_protocol();




}



//GLOBAL SCOPE VARIABLES:
//==============================//
let country_slug_map = new Map();
let countries_set = new Set();
let cases_date_map = new Map();
let US_pop = 0;
//==============================//


//Creating Line-Chart Object:
//===========================================================================//
var dates = [];
var cases = [];
var ctx_line = document.getElementById('line-chart').getContext('2d');
var line_graph = new Chart(ctx_line, {
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: '# of cases',
      fill: false,
      data:  cases,
      backgroundColor: '#66FCF1 ',
      borderColor: '#45A29E' 
    }]
  },
  options: {
    maintainAspectRatio: false,
    responsive: true,

    title: {
      display: true,
      text: 'Population Data',
      fontSize: 20
    },
    tooltips: {
      mode: 'label',
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          color: "#1F2833"
        },
        scaleLabel: {
          display: true,
          labelString: 'Weekly'
        }
      }],
      yAxes: [{
        display: true,
        gridLines: {
          color: "#1F2833"
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Cases'
        }
      }]
    }
  }
});
Chart.defaults.global.defaultFontColor = '#C5C6C7';





//Creating Pi-Chart Object:
//===========================================================================//
var total_population = 1;
var infected_population = 1;
var recovered_population = 0;
var deaths = 0;

var ctx_pi = document.getElementById('pi-chart').getContext('2d');
var pi_graph = new Chart(ctx_pi, {
  type: 'doughnut',
  data: {
    labels: ['Infected Population', 'Recovered Population', 'Deaths'],
    datasets: [{
      label: '# of cases',
      fill: false,
      data:  [ infected_population, recovered_population, deaths],
      backgroundColor: ['#66FCF1 ', '#45A29E', '#1F2833' ],
      borderColor: '#45A29E',
      hoverBackgroundColor: ['#66FCF1 ', '#45A29E', '#1F2833' ]
    }]
  }, 
  options: {
    maintainAspectRatio: false,
    responsive: true,

    title: {
      display: true,
      text: 'Affected Population',
      fontSize: 20
    }
  }
})
//===========================================================================//


//Adding event listeners to text fields:
var country_enter = document.getElementById('country')

 // Execute a function when the user releases a key on the keyboard
country_enter.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    country_input_protocol();
    /*
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("myBtn").click();
    */
  }
});




/////////////////=============================================/////////////////
                        //// Activating Main Function ////
main();
/////////////////=============================================/////////////////




function province_input_protocol() {
  var province_input = document.getElementById("province").value
  var country_input = document.getElementById("country").value
  if (province_input.length != 0 && country_input.length != 0) {


    //////////////////////////////
    /// Request API Connection ///
    //////////////////////////////
    var request = new XMLHttpRequest();
  
    request.open('GET', 'https://api.covid19api.com/dayone/country/' + country_input + '/status/confirmed', true)
    request.onload = function() {
      // Parsing API response JSON File:
      var data = JSON.parse(this.response);
      console.log(data);
    }
  
    // Send request
    request.send();
  }
}