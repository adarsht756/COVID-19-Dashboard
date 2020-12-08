const country_name_element = document.querySelector(".country .name");
const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");
const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");
const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");
const recovers_in_state = document.getElementById("recovers_in_state");
const deaths_in_state = document.getElementById("deaths_in_state");
const confirms_in_state = document.getElementById("confirms_in_state");
const currrentStateName = document.getElementById("stateName");
var opacityAnimation = document.getElementsByClassName("country-opacity-0");

var parent = document.getElementById("svg2");
var children = parent.children;
var stateDataRes;
var stateJSONData;
var last_recovers_in_state = 0, last_deaths_in_state = 0, last_confirms_in_state = 0;
var last_recovers_in_country = 0, last_deaths_in_country = 0, last_confirms_in_country = 0;


const ctx = document.getElementById("axes_line_chart").getContext("2d");
const ctxStateRecover = document.getElementById("axes_line_chart_state_recover").getContext("2d");
const ctxStateConfirm = document.getElementById("axes_line_chart_state_tested").getContext("2d");
const ctxStateTested = document.getElementById("axes_line_chart_state_confirm").getContext("2d");

async function statsIndia() {
  stateDataRes = await fetch("https://api.covid19india.org/v4/timeseries.json")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      stateJSONData = data;
      fetchStateData("UT");
    })
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
  user_country = element.target.attributes[1].value;
  var stateName = (innerHTML = element.target.attributes[1].value);
  currrentStateName.innerHTML = stateName;
}

// APP VARIABLES
let app_data = [],
  cases_list = [],
  recovered_list = [],
  deaths_list = [],
  deaths = [],
  formatedDates = [];

// SEPRATE STATE CHART VARIABLES
let stateCasesList = [],
  stateRecoveredList = [],
  stateConfirmedList = [],
  stateDates = [],
  stateDeathList = [],
  formatedStateDates = [];

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

    updateUI();
  };

  api_fetch(country);
}

fetchData(user_country);
var i = 0;

// lazy loading for better UI
const lazyLoad = () => {
  if (i === opacityAnimation.length) {
    clearInterval(timer);
    i = 0;
    return;
  }
  opacityAnimation[i].classList.add("opacity-1");
  i++;
};

// total object of last object in dates array
var totalObj;

// fetch state data
function fetchStateData(state) {
  console.log(state);
  (formatedDates = []),
    (stateCasesList = []),
    (stateRecoveredList = []),
    (stateConfirmedList = []),
    (stateDeathList = []),
    (stateDates = []),
    (formatedStateDates = []);

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };


  const api_fetch = (state) => {
    var confirmDelta = [], testedDelta = [], recoverDelta = [], datesDelta = [];
    for (var key in stateJSONData) {
      if (key === state) {
        var Dates = stateJSONData[key].dates
        for (var key in Dates) {
          totalObj = Dates[key].total
          var valLen = Object.keys(totalObj).length;
          var deltaObj = Dates[key].delta;
          if (valLen >= 4 && deltaObj != undefined) {
            datesDelta.push(key);
            testedDelta.push(deltaObj.tested);
            recoverDelta.push(deltaObj.recovered);
            confirmDelta.push(deltaObj.confirmed);
          }
        }
      }
    }

    for (var i = testedDelta.length - 20; i < testedDelta.length; ++i) {
      stateCasesList.push(testedDelta[i]);
      stateRecoveredList.push(recoverDelta[i]);
      stateConfirmedList.push(confirmDelta[i]);
      stateDates.push(datesDelta[i]);
    }

    updateSateUI();
  };
  api_fetch(state);
}

// UPDATE UI FUNCTION
function updateUI() {
  updateStats();
  axesLinearChart();
}

// UPDATE STATE CHARTS
function updateSateUI() {
  updateStateStats();
  axesLinearChartOfState();
}

function updateStats() {
  const total_cases = cases_list[cases_list.length - 1];
  const total_recovered = recovered_list[recovered_list.length - 1];
  const total_deaths = deaths_list[deaths_list.length - 1];
  var new_confirmed_cases = total_cases - cases_list[cases_list.length - 2];;
  var new_recovered_cases = total_recovered - recovered_list[recovered_list.length - 2];
  var new_deaths_cases = total_deaths - deaths_list[deaths_list.length - 2];

  country_name_element.innerHTML = user_country;
  total_cases_element.innerHTML = total_cases;
  animateValue(new_cases_element, last_confirms_in_country, new_confirmed_cases, 800, true);
  last_confirms_in_country = new_confirmed_cases;
  recovered_element.innerHTML = total_recovered;
  animateValue(new_recovered_element, last_recovers_in_country, new_recovered_cases, 800, true);
  last_recovers_in_country = new_recovered_cases;
  deaths_element.innerHTML = total_deaths;
  animateValue(new_deaths_element, last_deaths_in_country, new_deaths_cases, 800, true);
  last_deaths_in_country = new_deaths_cases;
  timer = setInterval(lazyLoad, 150);

  // format dates
  dates.forEach((date) => {
    formatedDates.push(formatDate(date));
  });
}

function animateValue(id, start, end, duration, flag) {
  // assumes integer values for start and end

  var obj = id;
  var range = end - start;
  // no timer shorter than 50ms (not really visible any way)
  var minTimer = 50;
  // calc step time to show all interediate values
  var stepTime = Math.abs(Math.floor(duration / range));

  // never go below minTimer
  stepTime = Math.max(stepTime, minTimer);

  // get current time and calculate desired end time
  var startTime = new Date().getTime();
  var endTime = startTime + duration;
  var timer;

  function run() {
    var now = new Date().getTime();
    var remaining = Math.max((endTime - now) / duration, 0);
    var value = Math.round(end - (remaining * range));
    if (flag)
      obj.innerHTML = `+${value}`;
    else obj.innerHTML = value;
    if (value == end) {
      clearInterval(timer);
    }
  }

  timer = setInterval(run, stepTime);
  run();
}

function updateStateStats() {
  animateValue(recovers_in_state, last_recovers_in_state, totalObj.recovered, 800, false);
  animateValue(deaths_in_state, last_deaths_in_state, totalObj.deceased, 800, false);
  animateValue(confirms_in_state, last_confirms_in_state, totalObj.confirmed, 800, false);
  last_confirms_in_state = totalObj.confirmed;
  last_deaths_in_state = totalObj.deceased;
  last_recovers_in_state = totalObj.recovered;

  // format dates
  stateDates.forEach((date) => {
    formatedStateDates.push(formatDate(date));
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

// UPDATE STATE CHARTS
var my_chart_state1, my_chart_state2, my_chart_state3;

function axesLinearChartOfState() {

  if (my_chart_state1)
    my_chart_state1.destroy();

  if (my_chart_state2)
    my_chart_state2.destroy();

  if (my_chart_state3)
    my_chart_state3.destroy();

  my_chart_state1 = new Chart(ctxStateRecover, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Recovered",
          data: stateRecoveredList,
          fill: false,
          borderColor: "green",
          backgroundColor: "green",
          borderWidth: 1,
        }
      ],
      labels: formatedStateDates
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  my_chart_state2 = new Chart(ctxStateConfirm, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Confirmed",
          data: stateConfirmedList,
          fill: false,
          borderColor: "red",
          backgroundColor: "red",
          borderWidth: 1,
        }
      ],
      labels: formatedStateDates
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  my_chart_state3 = new Chart(ctxStateTested, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Tested",
          data: stateCasesList,
          fill: false,
          borderColor: "blue",
          backgroundColor: "blue",
          borderWidth: 1,
        }
      ],
      labels: formatedStateDates
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
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