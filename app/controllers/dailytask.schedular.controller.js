const db = require("../models");
const sequelize = db.sequelize;
const erpRecord = db.erpRecord;
const dailyReport = db.dailyReport;
const dailyAttendance = db.dailyAttendance
const Op = db.Sequelize.Op;
const QueryTypes = sequelize.QueryTypes
const axios = require("axios");

var CronJob = require('cron').CronJob;
var employeeJob = new CronJob(
  '0 5 * * *',
  function () {
    employeeData();
  },
  null,
  true
);
var dailyTaskJob = new CronJob(
  '30 5 * * *',
  function () {
    dailyTask();
  },
  null,
  true
);
var dailyTaskJob = new CronJob(
  '0 6 * * *',
  function () {
    dailyAttend();
  },
  null,
  true
);
dailyTask();
function employeeData() {
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
      response.data?.map((emp, index) => {
        if (emp.UserErpId && emp.UserStatus == "Active") {
          delete emp.Createdat;
          delete emp.LastUpdatedAt;
          setTimeout(storeEmployee, 50 * index, emp)
        }
      })
    })
}
async function storeEmployee(emp) {
  erpRecord.create(emp)
    .then(data => {
    })
    .catch(err => {
      console.log(err);
    })
}
function dailyTask() {
  erpRecord.findAll()
    .then(data => {
      data.map((emp, index) => {
        //getTask(emp.dataValues.UserErpId)
        setTimeout(getTask, 100 * index, emp.dataValues.UserErpId)
      })
    })
}
async function getTask(id) {
  const date = "09/01/2022"
  axios({
    method: "get",
    url: `https://api.fieldassist.in/api/timeline/list?erpId=${id}&date=${date}`,
    headers: {
      "Content-Type": "multipart/form-data",
      'Authorization': 'Basic VGVzdF8xMTAwODpPRU82clBYZGRCOHdtU1pJISR4Iw==',
    }
  })
    .then(taskResponse => {
      taskResponse?.data?.UserTimelineDay?.map((task, index) => {
        task.UserErpId = taskResponse.data.ErpId
        setTimeout(storeTask, 50 * index, task);
      })
    })
    .catch(err => {
      console.log(err);
    })
}
async function storeTask(task) {
  dailyReport.create(task)
    .then(data1 => {
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
async function dailyAttend() {
  var count = 0;
  const data = await sequelize.query("select DayStartType, UserErpId, min(InTime) DayStart, max(OutTime) Dayend, date_format(current_date(),'%Y-%m-%d') CuurentDate from dailytasks where createdAt >date_format(current_date(),'%Y-%m-%d') and createdAt < date_format(current_date() +  INTERVAL 1 DAY ,'%Y-%m-%d') group by UserErpId;", { type: QueryTypes.SELECT });
  console.log(data[0]);
  data?.map(attend=>{
    dailyAttendance.create(attend)
    .then(data=>{
    })
    .catch(err=>{
      console.log(err);
    })
  })
}