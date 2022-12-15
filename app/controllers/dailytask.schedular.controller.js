const db = require("../models");
const msDB = require("../msModels");
const msSequelize = msDB.sequelize;
const sequelize = db.sequelize;
const erpRecord = db.erpRecord;
const dailyReport = db.dailyReport;
const salesDailyAttendance = db.salesDailyAttendance
const crmDailyAttendance = db.crmDailyAttendance;
const Op = db.Sequelize.Op;
const { QueryTypes } = require('sequelize');
const axios = require("axios");
var moment = require('moment');

var CronJob = require('cron').CronJob;

/* var cashfreeBalance = new CronJob(
    '',
    function(){
        cashfreeGetBalance()
    },
    null,
    true
) */

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
var sales_dailyAttendJob = new CronJob(
  '00 6 * * *',
  function () {
    sales_dailyAttend();
  },
  null,
  true
);
var crm_dailyAttendJob = new CronJob(
  '30 7 * * *',
  function () {
    crm_dailyAttend();
  },
  null,
  true
);
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
dailyTask();
function dailyTask() {
  console.log("hello");
  erpRecord.findAll()
    .then(data => {
      data.map((emp, index) => {
        //getTask(emp.dataValues.UserErpId)
        setTimeout(getTask, 100 * index, emp.dataValues.UserErpId)
      })
    })
}
async function getTask(id) {
  const date = '12/13/2022'//getMomentDate(); // mm/dd/yyyy
  const datearray = date.split("/");
  const sqlDate = datearray[2] + "-" + datearray[0] + "-" + datearray[1]
  console.log(sqlDate);
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
        task.PunchDate = sqlDate
        setTimeout(storeTask, 100 * index, task);
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
function getMomentDate() {
  var prev_date = moment().subtract(1, 'days');
  var day = prev_date.date();
  if (day < 10) {
    day = "0" + day;
  }
  var month = prev_date.month() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  const year = prev_date.year();
  const final_date = month + "/" + day + "/" + year;
  return (final_date);
}
async function sales_dailyAttend() {
  const data = await sequelize.query("select employee_id, InTime, OutTime from ( select daystarttype DayStartType,date_format(InTime,'%Y-%m-%d') Date,UserErpId,PunchDate, sales_mst.new_e_code employee_id, min(date_add(case when ActivityType='Day End (Normal)' then OutTime else  InTime end,INTERVAL 330 minute)) InTime, max(date_add(case when ActivityType='Day Start' then InTime else  OutTime end,INTERVAL 330 minute)) OutTime from dailytasks as tasks, sales_employee_mapping as sales_mst where tasks.UserErpId = sales_mst.sales_id and InTime >date_format(current_date() - INTERVAL 1 DAY ,'%Y-%m-%d') and InTime < date_format(current_date(),'%Y-%m-%d') group by daystarttype,PunchDate,UserErpId order by daystarttype,usererpid,PunchDate) tt;", { type: QueryTypes.SELECT });
  data?.map(async attend => {
    //sales_mssql(attend);
    console.log(attend);
    console.log(`${attend.InTime}`);
    await sequelize.query(`Insert into sales_dailyattendances (employee_id, InTime, OutTime, createdAt, updatedAt) values ('${attend.employee_id}','${attend.InTime?.toISOString().slice(0, 19).replace('T', ' ')}', '${attend.OutTime?.toISOString().slice(0, 19).replace('T', ' ')}',now(),now())`, { type: QueryTypes.INSERT })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
    /* salesDailyAttendance.create(attend)
      .then(data => {
      })
      .catch(err => {
        console.log(err);
      }) */
  })
  const unmatched_data = await sequelize.query(`select UserErpId as employee_id, min(date_add(case when ActivityType='Day End (Normal)' then OutTime else  InTime end,INTERVAL 330 minute)) InTime, max(date_add(case when ActivityType='Day Start' then InTime else  OutTime end,INTERVAL 330 minute)) OutTime from dailytasks as tasks where InTime >date_format(current_date() - INTERVAL 1 DAY ,'%Y-%m-%d') and InTime < date_format(current_date(),'%Y-%m-%d') and UserErpId Not In (select distinct(sales_id) from sales_employee_mapping) group by daystarttype,PunchDate,UserErpId order by daystarttype,usererpid,PunchDate;`, { type: QueryTypes.SELECT });
  unmatched_data?.map(async attend => {
    //sales_mssql(attend);
    console.log(attend);
    await sequelize.query(`Insert into sales_dailyattendances (employee_id, InTime, OutTime, createdAt, updatedAt) values ('${attend.employee_id}','${attend.InTime?.toISOString().slice(0, 19).replace('T', ' ')}', '${attend.OutTime?.toISOString().slice(0, 19).replace('T', ' ')}',now(),now())`, { type: QueryTypes.INSERT })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
    /* salesDailyAttendance.create(attend)
      .then(data => {
      })
      .catch(err => {
        console.log(err);
      }) */
  })
}
async function sales_mssql(data) {
  var dayStart = ''
  var dayEnd = ''
  if (data.InTime) {
    dayStart = data.InTime?.toISOString();
  }
  if (data.OutTime) {
    dayEnd = data.OutTime?.toISOString();
  }
  console.log(dayStart);
  console.log(dayEnd);
  await msSequelize.query(`INSERT INTO mtek_raw_punch_ps_napp(Empid ,Punch_Date_Time ,RP_CREATED_DATE ,Record_LastUpdated ,Isread) VALUES ('${data.employee_id}','${dayStart}',GETDATE(),GETDATE(),'0')`, { type: QueryTypes.INSERT })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    })
  await msSequelize.query(`INSERT INTO mtek_raw_punch_ps_napp(Empid ,Punch_Date_Time ,RP_CREATED_DATE ,Record_LastUpdated ,Isread) VALUES ('${data.employee_id}','${dayEnd}',GETDATE(),GETDATE(),'0')`, { type: QueryTypes.INSERT })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    })
}
async function crm_dailyAttend() {
  const data = await sequelize.query("select new_e_code employee_id,in_time InTime, out_time OutTime from ( select * from attendancedata t1,crm_employee_mapping t2 where  t1.punch_date >=date_format(current_date() -  INTERVAL 1 DAY,'%Y-%m-%d') and t1.punch_date < date_format(current_date(),'%Y-%m-%d') and t1.eng_id=t2.employee_id ) tt;", { type: QueryTypes.SELECT });
  console.log(data[0]);
  data?.map(async attend => {
    crm_mssql(attend);
    console.log(attend);
    console.log(`${attend.InTime}`);
    console.log(attend);
      await sequelize.query(`Insert into crm_dailyattendances (employee_id, InTime, OutTime, createdAt, updatedAt) values ('${attend.employee_id}','${attend.InTime}', '${attend.OutTime}',now(),now())`, { type: QueryTypes.INSERT })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
    /* crmDailyAttendance.create(attend)
      .then(data => {
      })
      .catch(err => {
        console.log(err);
      }) */
  })
  const unmatched_data = await sequelize.query(`select eng_id employee_id,in_time InTime, out_time OutTime from ( select * from attendancedata t1 where  t1.punch_date >=date_format(current_date() -  INTERVAL 1 DAY,'%Y-%m-%d') and  t1.punch_date < date_format(current_date(),'%Y-%m-%d') and  t1.eng_id Not In (select distinct(employee_id) from crm_employee_mapping) ) tt;`, { type: QueryTypes.SELECT });
  console.log(unmatched_data[0]);
  unmatched_data?.map(async attend => {
    crm_mssql(attend);
    console.log(attend);
      await sequelize.query(`Insert into crm_dailyattendances (employee_id, InTime, OutTime, createdAt, updatedAt) values ('${attend.employee_id}','${attend.InTime}', '${attend.OutTime}',now(),now())`, { type: QueryTypes.INSERT })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
    /* crmDailyAttendance.create(attend)
      .then(data => {
      })
      .catch(err => {
        console.log(err);
      }) */
  })
}
async function crm_mssql(data) {
  await msSequelize.query(`INSERT INTO mtek_raw_punch_ps_napp(Empid ,Punch_Date_Time ,RP_CREATED_DATE ,Record_LastUpdated ,Isread) VALUES ('${data.employee_id}','${data.InTime}',GETDATE(),GETDATE(),'0')`, { type: QueryTypes.INSERT })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    })
  await msSequelize.query(`INSERT INTO mtek_raw_punch_ps_napp(Empid ,Punch_Date_Time ,RP_CREATED_DATE ,Record_LastUpdated ,Isread) VALUES ('${data.employee_id}','${data.OutTime}',GETDATE(),GETDATE(),'0')`, { type: QueryTypes.INSERT })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    })
}

function cashfreeGetBalance(){
    const options = {
        method: 'POST',
        url: 'https://payout-api.cashfree.com/payout/v1/authorize',
        headers: { 
            'X-Client-Id': 'CF282299CD3U1TLGL813I08185MG', 
            'X-Client-Secret': 'ba13b6e971c3842339fb7af2854c38d70f42ca49'
          },
      };
    axios.request(options)
    .then((res)=>{
            console.log(res.data);
            const get_balance_options = {
              method: 'GET',
              url: 'https://payout-api.cashfree.com/payout/v1.2/getBalance',
              headers: { 
                  'Authorization': `Bearer ${res.data.data.token}`, 
                  'Content-Type': 'application/json'
                },
            };
          axios.request(get_balance_options)
          .then(response=>{
            console.log(response.data);
          })
    })
    .catch((err)=>{
        console.log(err);
    })
}   
cashfreeGetBalance();