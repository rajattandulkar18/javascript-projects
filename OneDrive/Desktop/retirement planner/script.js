/* jshint browser: true, devel: true, esversion: 6 */
/* globals Chart, numeral */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var form = document.getElementById("calc-form");
  form.addEventListener("submit", submit, false);
  
  var startAgeInput = document.getElementById("start-age");
  startAgeInput.addEventListener("input", validateAges, false);
  
  var stopAgeInput = document.getElementById("stop-age");
  stopAgeInput.addEventListener("input", validateAges, false);

  var resultsContainer = document.getElementById("calc-results");
  var canvas = document.getElementById("chart");
  var context = canvas.getContext("2d");
  var chart;

  function submit(event) {
    event.preventDefault();
    var chartData = calculate({
      startAge: getNumberFrom("start-age"),
      stopAge: getNumberFrom("stop-age"),
      annualContribution: getNumberFrom("annual-contribution"),
      annualReturn: getNumberFrom("annual-return")
    });
    graph(chartData);
  }

  function calculate(data) {
    var ages = getRange(data.startAge, 100);
    return {
      labels: ages,
      datasets: [
        {
          type: "line",
          fill: false,
          showLine: true,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 5,
          label: "Contributions",
          data: ages.map((y) => contributionsAtAge(y, data)),
          backgroundColor: "rgb(199, 56, 56)",
          borderColor: "rgb(199, 56, 56)"
        },
        {
          label: "Earnings",
          data: ages.map((y) => futureValueAtAge(y, data)),
          backgroundColor: "rgb(142, 199, 56)"
        }
      ]
    };
  }

  function graph(data) {
    if (chart != null) chart.destroy();
    chart = new Chart(context, configureChart(data));
    resultsContainer.style.opacity = 1;
    resultsContainer.scrollIntoView();
  }

  function getNumberFrom(id) {
    return Number(document.getElementById(id).value);
  }

  function configureChart(data) {
    return {
      type: "bar",
      data: data,
      options: {
        responsive: true,
        responsiveAnimationDuration: 500,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: (value) => numeral(value).format("$0,0[.]0a")
              },
              gridLines: {
                color: "rgba(140, 140, 140, 0.2)"
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        }
      }
    };
  }

  function getRange(low, high) {
    var list = [];
    for (var i = low; i <= high; i++) {
      list.push(i);
    }
    return list;
  }

  function contributionsAtAge(age, data) {
    var years = age - data.startAge + 1;
    var contribution = age > data.stopAge ? undefined : data.annualContribution;
    return Math.floor(years * contribution);
  }
  
  function futureValueAtAge(age, data) {
    var interestRate = data.annualReturn / 100;
    if (age > data.stopAge) {
      var priorEarnings = futureValueAtAge(age - 1, data);
      return priorEarnings + (priorEarnings * interestRate);
    }
    else {
      var years = age - data.startAge + 1;
      return Math.floor(futureValue(interestRate, years, -data.annualContribution, 0, 1)); 
    }
  }
  
  //https://gist.github.com/lancevo/6010111
  function futureValue(interestRate, paymentPeriods, paymentPerPeriod, presentValue, type) {
    presentValue = presentValue || 0;
    type = type || 0;
    var pow = Math.pow(1 + interestRate, paymentPeriods);
	  var result;
    if (interestRate) {
      result = (paymentPerPeriod * (1 + interestRate * type) * (1 - pow)) / interestRate - presentValue * pow;
    }
	  else {
        result = -1 * (presentValue + paymentPerPeriod * paymentPeriods);
    }
    return result;
  }
  
  function validateAges(event) {
    startAgeInput.setCustomValidity("");
    stopAgeInput.setCustomValidity("");
    
    var startAge = Number(startAgeInput.value);
    var stopAge = Number(stopAgeInput.value);
    
    if (startAge >= stopAge) {
      event.target.setCustomValidity("Start age must be less than stop age.");
    }
  }
});