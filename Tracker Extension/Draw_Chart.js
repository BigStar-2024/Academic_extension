const getDat = async () => {
  try {
    let result = await chrome.storage.sync.get(["history"]);
    let parsedJSON = JSON.parse(result.history);
    if (Object.keys(parsedJSON).length === 0) return initialData;
    else return parsedJSON;
  } catch (error) {
    console.log("Error corrupted: ", error);
  }
}

const sumOfJSON = (jsonData, startDate, endDate) => {
  let sum = 0;
  Object.values(jsonData).map(val => {
    let filteredObj = filterData(val, startDate, endDate);
    Object.values(filteredObj).map(value => sum += value)
  });
  return sum;
}

const getDateString = (date) => {
  let curDate = new Date(date);
  let dateString = curDate.getFullYear() + "-" + (curDate.getMonth() + 1) + "-" + curDate.getDate();
  return dateString;
}

const filterData = ((data, startDate, endDate) => {
  let filteredData = {};
  Object.keys(data).map(key => {
    if (new Date(startDate) <= new Date(key) && new Date(key) <= new Date(endDate)) filteredData[key] = data[key];
  });
  return filteredData;
});

const getHoursAndMinutes = miliseconds => {
  let hours = Math.floor(miliseconds / 60);
  let minutes = Math.floor((miliseconds % 60) / 1);
  return `${hours}h:${minutes}min`;
};

// let SendData;

const drawChart = () => {
  let displayMode = "";
  let startDate = "";
  let endDate = "";

  getDat().then(data => {

    // Searching display mode
    let weekClsName = document.getElementById("week-btn").className;
    let dayClsName = document.getElementById("day-btn").className;
    let monthClsName = document.getElementById("month-btn").className;
    if (weekClsName.includes("active")) displayMode = "week";
    if (dayClsName.includes("active")) displayMode = "day";
    if (monthClsName.includes("active")) displayMode = "month";

    // Getting start day and end day of each mode day range
    if (displayMode === "week") {
      let weekNum = new Date().getDay();
      console.log(weekNum);
      startDate = getDateString(new Date(Date.now() - (weekNum) * 24 * 60 * 60 * 1000));
      endDate = getDateString(new Date(Date.now() + (6 - weekNum) * 24 * 60 * 60 * 1000));
    }
    if (displayMode === "day") {
      startDate = getDateString(new Date());
      endDate = getDateString(new Date());
    }
    if (displayMode === "month") {
      let year = new Date().getFullYear();
      let month = new Date().getMonth();
      startDate = getDateString(new Date(year, month, 1));
      endDate = getDateString(new Date(year, month, 31));
    }

    // console.log(startDate, endDate);

    let newData = {};
    Object.keys(data).map(key => {
      newData[key] = 0;
      Object.keys(data[key]).map(key1 => {
        if (new Date(startDate) <= new Date(key1) && new Date(key1) <= new Date(endDate)) newData[key] += data[key][key1];
      });
    });

    // console.log(data);
    // console.log(newData);



    // SendData = newData;

    const xValues = ["TOTAL", ...Object.keys(newData)];
    const yValues = [sumOfJSON(data, startDate, endDate), ...Object.values(newData)];
    const barColors = ["green", "red", "#9747FF", "#0D99FF"];

    document.getElementById('week').style.display = 'none';
    document.getElementById('day').style.display = 'none';
    document.getElementById('month').style.display = 'none';

    document.getElementById(displayMode).style.display = 'block';

    new Chart(displayMode, {
      type: "bar",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues,

        }]
      },
      options: {
        legend: { display: false },

        title: {
          display: true,
          text: "DASHBOARD",
          fontColor: "#14AE5C",
          fontSize: 30,

        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'M  I  N  U  T  E  S',
              fontColor: "#14AE5C",
              fontSize: 20
            },
            ticks: {
              fontColor: "#14AE5C",
              fontSize: 17,
              stepSize: 20,
              beginAtZero: true,
              // max: 1440,
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: "#14AE5C",
              fontSize: 15,
              beginAtZero: true
            }
          }]
        },
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              return getHoursAndMinutes(tooltipItems.yLabel);
            }, labelTextColor: function (tooltipItem, chart) {
              return '#000';
            }
          },
          titleSpacing: 5,
          backgroundColor: '#ffffff',
          titleFontColor: '#000000',
          cornerRadius: 0,
          xPadding: 10,
          yPadding: 10,
          mode: 'index'
        }
      }
    });
  });
};

// Draw chart when first loading
drawChart();

document.getElementById('week-btn').addEventListener('click', function () {
  drawChart();
});
document.getElementById('day-btn').addEventListener('click', function () {
  drawChart();
});
document.getElementById('month-btn').addEventListener('click', function () {
  drawChart();
});

document.getElementById('email-setting').addEventListener('click', function () {
   AutomateSendEmail();
});

document.getElementById('need-help').addEventListener('click', function () {
  sendHelpMessagesFromExtension();
});

const sendHelpMessagesFromExtension = async () => {
  // console.log('here!');

  const fromEmail = document.getElementById('fromEmail').value;
  const toEmail = document.getElementById('toEmail').value;
  const password = document.getElementById('password').value;
  const helpmessages = document.getElementById('help-area').value.replace('\n', ' ');

  try {
    let response = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // messages: SendData,
        fromEmail: fromEmail,
        toEmail: toEmail,
        password: password,
        helpmessage: helpmessages
      }),
    });
  } catch (err) {
    console.log(err);
  }
};


const AutomateSendEmail = async () => {

  const fromEmail = document.getElementById('fromEmail').value;
  const toEmail = document.getElementById('toEmail').value;
  const password = document.getElementById('password').value;
  
  const message = {
    fromEmail: fromEmail,
    toEmail: toEmail,
    password: password
  };

  sendMessagetoBackground(message);

};

const sendMessagetoBackground = async (message) => {

  const response = await chrome.runtime.sendMessage(message);
  console.log("send successfully!");
}

