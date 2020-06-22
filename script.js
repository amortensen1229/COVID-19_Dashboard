
function country_input_protocol() {
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
  document.getElementById('province').value = '';

  if (country_input == "Global") {
    pi_chart_protocol();
    return;
  }

  
  /////////////////////////////////////////////
  /// Request API Connection - COVID-19 API ///
  /////////////////////////////////////////////
  var request_covid = new XMLHttpRequest();
  request_covid.open('GET', api_link, true)

  request_covid.onload = function() {

    // Parsing API response JSON File:
    var data = JSON.parse(this.response);
    cases_date_map.clear();
    for (let item of data) {
      cases_date_map.set(item.Date, item.Cases);
    }
    line_chart_protocol();
    pi_chart_protocol();
    fill_state_options(state_codes);
  }

  // Send request
  request_covid.send();
}


function pi_chart_protocol() {
  var pop_data = [ 
    infected_population, 
    recovered_population, 
    deaths];


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



function line_chart_protocol() {
  //Get Data:
  var dates = []
  var cases = []
  var index = 0;
  for (let item of cases_date_map) {
    index++;
    if (index % 7 == 0) {
      if (item[0].includes('T')) {
        dates.push((item[0].split("T")[0]));
        cases.push(item[1]);
      } else {
        var year = item[0].slice(0,4);
        var month = item[0].slice(4,6);
        var day = item[0].slice(6,8);
        dates.push(year + '-' + month + '-' + day);
        cases.push(item[1]);
       
      }
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



function province_input_protocol() {
  var province_input = document.getElementById("province").value;
  var country_input = document.getElementById('country').value;
  if (country_input == 'United States of America') {
    var state_abv = '';
    //convert province input value to connected state code:
    for (let pair of state_codes) {
      if (pair[0] == province_input) {
        state_abv = pair[1];
      }
    }
    console.log(state_abv);

    //////////////////////////////
    /// Request API Connection ///
    //////////////////////////////
    var request = new XMLHttpRequest();
    cases_date_map.clear();
    request.open('GET', 'https://covidtracking.com//api/v1/states/daily.json', true)
    request.onload = function() {

      // Parsing API response JSON File:
      var data = JSON.parse(this.response);
      var index = 0;
      console.log(data);
      for (i = data.length-1; i > 0; i--) {
        if (data[i].state == state_abv) {
          cases_date_map.set((data[i].date).toString(), data[i].positive);
          index = i;
        }
      }
      infected_population = data[index].positive;
      recovered_population = data[index].recovered;
      deaths = data[index].death;
      console.log(deaths);
      console.log(infected_population);
      console.log(recovered_population);
      console.log(index);
      document.getElementById("total-deaths").innerHTML = "Total Deaths: " + (data[index].death);
      document.getElementById("total-cases").innerHTML = "Total Cases: " + (data[index].positive);
      document.getElementById("total-recovered").innerHTML = "Total Recovered: " + (data[index].recovered);
      document.getElementById("new-deaths").innerHTML = "New Deaths: " + (data[index].deathIncrease);
      document.getElementById("new-cases").innerHTML = "New Cases: " + (data[index].positiveIncrease);
      document.getElementById("new-recovered").innerHTML = "New Recovered: " + ('N/A');
      document.getElementById("information-header").innerHTML = "Statistics: " + (province_input);
      
      
      line_chart_protocol();
      pi_chart_protocol();
    }
    
    // Send request
    request.send();
  }
}


function fill_state_options(state_codes) {
  var states_searchables = document.getElementById('states');
  if (document.getElementById('country').value == "United States of America") {
    var options = '';
    for (let pair of state_codes) {
      options += '<option value="'+pair[0]+'" />';
    }
    states_searchables.innerHTML = options;
  } else {
    states_searchables.innerHTML = '';
  }
}




function fill_state_codes() {
  var states = [
    ['Arizona', 'AZ'],
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['Arkansas', 'AR'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
  ];
  return states;
}

/*********************************/
////////// Main Function //////////
/*********************************/
function main() {
  state_codes = fill_state_codes();
  fill_country_information();
  fill_state_options(state_codes);
}



//GLOBAL SCOPE VARIABLES:
//==============================//
let country_slug_map = new Map();
let countries_set = new Set();
let cases_date_map = new Map();
let US_pop = 0;
let state_codes = [];
var dates = [];
var cases = [];
var total_population = 1;
var infected_population = 1;
var recovered_population = 0;
var deaths = 0;
//==============================//





//Creating Line-Chart Object:
//===========================================================================//
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
      mode: 'nearest',
      intersect: false,
      backgroundColor: '#1F2833'
    },
    hover: {
      intersect: false
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




////////////////////////////////////////////
// Adding event listeners to text fields: //
////////////////////////////////////////////
//===========================================================================//
var country_enter = document.getElementById('country')
var province_enter = document.getElementById('province')

//Using Enter key to call Protocols:

country_enter.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    country_input_protocol();
  }
});

province_enter.addEventListener("keyup",function(event) {
  if (event.keyCode == 13) {
    province_input_protocol();
  }
});
//===========================================================================//


function iphoneX (is_iphone_view) {
  if (is_iphone_view.matches) { 
    line_graph.options.scales.yAxes = [{
      gridLines: {
        //drawBorder: false
      }
    }]
    line_graph.update();
  }
}

/////////////////////////////////////////////
// Adding event listeners for media query: //
/////////////////////////////////////////////
var is_iphone_view = window.matchMedia("(max-width: 375px)");
iphoneX(is_iphone_view);
is_iphone_view.addListener(iphoneX);







/////////////////=============================================/////////////////
                        //// Activating Main Function ////
main();
/////////////////=============================================/////////////////