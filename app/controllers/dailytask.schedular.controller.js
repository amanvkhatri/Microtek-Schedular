const db = require("../models");
const sequelize = db.Sequelize;
const erpRecord = db.erpRecord;
const dailyReport = db.dailyReport;
const Op = db.Sequelize.Op;
const axios = require("axios");


var CronJob = require('cron').CronJob;
var job = new CronJob(
  '0 1 * * *',
  function () {
    employeeData();
  },
  null,
  true
);
var job = new CronJob(
  '0 2 * * *',
  function () {
    dailyTask();
  },
  null,
  true
);

function employeeData() {
  var count = 0;
  const options = {
    method: 'GET',
    url: 'https://api.fieldassist.in/api/masterdata/employee/list?EpochTime=18',
    headers: {
      'Authorization': 'Basic VGVzdF8xMTAwODpPRU82clBYZGRCOHdtU1pJISR4Iw==',
    },
  };
  erpRecord.truncate()
    .then(data => {
      //console.log(data);
    })
    .catch(err => {
      console.log(err);
    })
  axios.request(options)
    .then(response => {
      const length1 = response.data.length;
      console.log(length1);
      response.data?.map((emp, index1) => {
        if (emp.UserErpId && emp.UserStatus == "Active") {
          count = count + 1;
          delete emp.Createdat;
          delete emp.LastUpdatedAt;

          erpRecord.create(emp)
            .then(data => {
              console.log(count);
            })
            .catch(err => {
              console.log(err);
            })
        }
      })
    })
}
var count = 0;
var tempcount = 0;
function dailyTask() {
  erpRecord.findAll()
    .then(data => {
      data.map((emp, index) => {
        //getTask(emp.dataValues.UserErpId)
        setTimeout(getTask, 50 * index, emp.dataValues.UserErpId)
      })
    })
}
async function getTask(id) {
  const date = getDate()
  axios({
    method: "get",
    url: `https://api.fieldassist.in/api/timeline/list?erpId=${id}&date=${date}`,
    headers: {
      "Content-Type": "multipart/form-data",
      'Authorization': 'Basic VGVzdF8xMTAwODpPRU82clBYZGRCOHdtU1pJISR4Iw==',
    }
  })
    .then(taskResponse => {
      count = count + 1;
      taskResponse?.data?.UserTimelineDay?.map((task, index) => {
        task.UserErpId = taskResponse.data.ErpId
        setTimeout(storeTask, 10 * index,task);
      })
    })
    .catch(err => {
      console.log(err);
    })
}
async function storeTask(task) {
  dailyReport.create(task)
    .then(data1 => {
      tempcount = tempcount + 1;
      console.log(count);
      console.log(tempcount);
    })
    .catch(err => {
      console.log(err);
    })
}

function getDate() {
  var date = new Date();
  var prev_date = new Date(date.setDate(date.getDate() - 1));
  var day = prev_date.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  var month = prev_date.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  const year = prev_date.getFullYear();
  const final_date = month + "/" + day + "/" + year;
  return (final_date);
}