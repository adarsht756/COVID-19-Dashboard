const country_name_element = document.querySelector(".country .name");
const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");
const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");
const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");
var parent = document.getElementById("svg2");
var children = parent.children;
var stateDataRes;
var stateJSONData;

const ctx = document.getElementById("axes_line_chart").getContext("2d");

async function statsIndia() {
  var res = await fetch("https://api.covid19api.com/country/india");
  var data = await res.json();
  stateDataRes = await fetch("https://api.covid19india.org/v4/timeseries.json");
  stateJSONData = stateDataRes.json();
  // document.getElementById("sub-indstats1").innerHTML =
  //   "Active Cases:<br /><span style='color: blue'>" +
  //   data[data.length - 1].Active;
  // document.getElementById("sub-indstats2").innerHTML =
  //   "Deaths:<br /><span style='color: red'>" + data[data.length - 1].Deaths;
  // document.getElementById("sub-indstats3").innerHTML =
  //   "Recovered:<br /><span style='color: green'>" +
  //   data[data.length - 1].Recovered;
  // document.getElementById("sub-stats1").innerHTML =
  //   "Active Cases:<br />" + data[data.length - 1].Active;
  // document.getElementById("sub-stats2").innerHTML =
  //   "Deaths:<br />" + data[data.length - 1].Deaths;
  // document.getElementById("sub-stats3").innerHTML =
  //   "Recovered:<br />" + data[data.length - 1].Recovered;
}

for (let i = 0; i < children.length; ++i) {
  children[i].onmouseover = hoverOn;
  children[i].onmouseout = hoverOff;
  children[i].onclick = selectState;
}

function hoverOn(ref) {
  ref.target.classList.add("animation");
  ref.target.style.cursor = "pointer";
}

function hoverOff(ref) {
  ref.target.classList.remove("animation");
}

async function selectState(element) {
  fetchStateData(element.target.attributes[0].value);
  // document.getElementById("table-header").innerHTML =
  //   element.target.attributes[1].value;
  user_country = element.target.attributes[1].value;
  // window.scrollBy(0, 800);
  var stateName = (innerHTML = element.target.attributes[1].value);
  var resource = await fetch("https://api.covid19india.org/data.json");
  var stateData = await resource.json();
  var allStates = stateData.statewise;
  var selectedState = null;
  for (let i = 0; i < allStates.length; ++i) {
    if (allStates[i].state == stateName) {
      selectedState = allStates[i];
      break;
    }
  }
  // document.getElementById("sub-stats1").innerHTML =
  //   "Active Cases:<br />" + selectedState.active;
  // document.getElementById("sub-stats2").innerHTML =
  //   "Deaths:<br />" + selectedState.deaths;
  // document.getElementById("sub-stats3").innerHTML =
  //   "Recovered:<br />" + selectedState.recovered;
}

// APP VARIABLES
let app_data = [],
  cases_list = [],
  recovered_list = [],
  deaths_list = [],
  deaths = [],
  formatedDates = [];

// GET USERS COUNTRY CODE
let country_code = geoplugin_countryCode();
let user_country;
country_list.forEach((country) => {
  if (country.code == country_code) {
    user_country = country.name;
  }
});
/* ---------------------------------------------- */
/*                     FETCH API                  */
/* ---------------------------------------------- */

// fetch country data
function fetchData(country) {
  user_country = country;
  country_name_element.innerHTML = "Loading...";

  (cases_list = []),
    (recovered_list = []),
    (deaths_list = []),
    (dates = []),
    (formatedDates = []);

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const api_fetch = async (country) => {
    await fetch(
      "https://api.covid19api.com/total/country/" +
      country +
      "/status/confirmed",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          dates.push(entry.Date);
          cases_list.push(entry.Cases);
        });
      });

    await fetch(
      "https://api.covid19api.com/total/country/" +
      country +
      "/status/recovered",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          recovered_list.push(entry.Cases);
        });
      });

    await fetch(
      "https://api.covid19api.com/total/country/" + country + "/status/deaths",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          deaths_list.push(entry.Cases);
        });
      });

    updateUI(true);
  };

  api_fetch(country);
}

fetchData(user_country);


// fetch state data
function fetchStateData(state) {
  country_name_element.innerHTML = "Loading...";

  (cases_list = []),
    (recovered_list = []),
    (deaths_list = []),
    (dates = []),
    (formatedDates = []);

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const api_fetch = async (state) => {
    await fetch(
      "https://api.covid19india.org/v4/timeseries.json",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((stateJSONData) => {
        for (var key in stateJSONData) {
          if (key === state) {
            var Dates = stateJSONData[key].dates
            for (var key in Dates) {
              var val = Dates[key].total
              var valLen = Object.keys(val).length;
              if (valLen >= 4) {
                dates.push(key);
                cases_list.push(val.tested);
                recovered_list.push(val.recovered);
                deaths_list.push(val.deceased);
              }
            }
          }
        }
      });

    updateUI(false);
  };

  api_fetch(state);
}

fetchStateData(user_country);

// UPDATE UI FUNCTION
function updateUI(flag) {
  updateStats(flag);
  axesLinearChart();
}

function updateStats(flag) {
  const total_cases = cases_list[cases_list.length - 1];
  const total_recovered = recovered_list[recovered_list.length - 1];
  const total_deaths = deaths_list[deaths_list.length - 1];
  var new_confirmed_cases;
  var new_recovered_cases;
  var new_deaths_cases;
  if (flag) {
    new_confirmed_cases = total_cases - cases_list[cases_list.length - 2];
    new_recovered_cases =
      total_recovered - recovered_list[recovered_list.length - 2];
    new_deaths_cases = total_deaths - deaths_list[deaths_list.length - 2];
  }
  else {
    new_confirmed_cases = cases_list[cases_list.length - 2] - cases_list[cases_list.length - 3];
    new_recovered_cases = recovered_list[recovered_list.length - 2] - recovered_list[recovered_list.length - 3];
    new_deaths_cases = deaths_list[deaths_list.length - 2] - deaths_list[deaths_list.length - 3];
    // console.log(deaths_list[deaths_list.length - 2], deaths_list[deaths_list.length - 3]);
  }

  country_name_element.innerHTML = user_country;
  total_cases_element.innerHTML = total_cases;
  new_cases_element.innerHTML = `+${new_confirmed_cases}`;
  recovered_element.innerHTML = total_recovered;
  new_recovered_element.innerHTML = `+${new_recovered_cases}`;
  deaths_element.innerHTML = total_deaths;
  new_deaths_element.innerHTML = `+${new_deaths_cases}`;

  // format dates
  dates.forEach((date) => {
    formatedDates.push(formatDate(date));
  });
}

// UPDATE CHART
let my_chart;
function axesLinearChart() {
  if (my_chart) {
    my_chart.destroy();
  }

  my_chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Cases",
          data: cases_list,
          fill: false,
          borderColor: "#000",
          backgroundColor: "#000",
          borderWidth: 1,
        },
        {
          label: "Recovered",
          data: recovered_list,
          fill: false,
          borderColor: "#009688",
          backgroundColor: "#009688",
          borderWidth: 1,
        },
        {
          label: "Deaths",
          data: deaths_list,
          fill: false,
          borderColor: "#f44336",
          backgroundColor: "#f44336",
          borderWidth: 1,
        },
      ],
      labels: formatedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// FORMAT DATES
const monthsNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(dateString) {
  let date = new Date(dateString);
  return `${date.getDate()} ${monthsNames[date.getMonth() - 1]}`;
}
