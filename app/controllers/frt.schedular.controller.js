const frtdb = require('../frtModel/index');
const awsdb = require('../awsModels');
const db = require("../models/index");
const { QueryTypes } = require('sequelize');
const axios = require("axios");
var moment = require('moment');

var CronJob = require('cron').CronJob;

var frt_logs_sync = new CronJob(
    '*/5 * * * *',
    function () {
        frt_logs_schedular()
    },
    null,
    true
)

var frt_employee_sync = new CronJob(
    '*/10 * * * *',
    function () {
        frt_employee_schedular()
    },
    null,
    true
)

var frt_device_sync = new CronJob(
    '* */12 * * *',
    function () {
        frt_device_schedular
    },
    null,
    true
)

async function frt_logs_schedular() {
    const schedular_data = await awsdb.sequelize.query(`select count(1) status from mtek_db.schedular_status_master where schedular_name = 'frt_logs_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.SELECT });
    console.log(schedular_data);
    if (schedular_data[0]?.status == '1') {
        console.log("schedular running");
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'inprogress', last_run_date = now() where schedular_name = 'frt_logs_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
        frtLogsSync();
    }
}
async function frt_employee_schedular() {
    const schedular_data = await awsdb.sequelize.query(`select count(1) status from schedular_status_master where schedular_name = 'frt_employee_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.SELECT });
    console.log(schedular_data);
    if (schedular_data[0]?.status == '1') {
        console.log("schedular running");
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'inprogress', last_run_date = now() where schedular_name = 'frt_employee_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
        frtEmployeeSync();
    }
}
async function frt_device_schedular() {
    const schedular_data = await awsdb.sequelize.query(`select count(1) status from schedular_status_master where schedular_name = 'frt_device_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.SELECT });
    console.log(schedular_data);
    if (schedular_data[0]?.status == '1') {
        console.log("schedular running");
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'inprogress', last_run_date = now() where schedular_name = 'frt_device_sync' and status = 'completed' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
        frtDeviceSync();
    }
}
async function frtLogsSync() {
    const date = getdate();

    const day = parseInt(date.day);
    const month = parseInt(date.month);

    const frt_max_logs = await awsdb.sequelize.query(`select max(cast(frt_log_id as unsigned)) max_id from ceam_db.frt_logs where log_date > '${date.year}-${date.month}-01'`, { type: QueryTypes.SELECT });
    console.log(frt_max_logs);
    var max_fetch_id = '0';
    if (frt_max_logs[0]?.max_id) {
        max_fetch_id = frt_max_logs[0]?.max_id
    }
    if (day == 1) {
        const frt_max_logs_day1 = await awsdb.sequelize.query(`select max(cast(frt_log_id as unsigned)) max_id from ceam_db.frt_logs where log_date > '${date.year}-${date.month}-${date.day}'`, { type: QueryTypes.SELECT });
        console.log(frt_max_logs_day1);
        if (frt_max_logs_day1[0]?.max_id) {
            max_fetch_id = frt_max_logs_day1[0]?.max_id
        }
        else {
            max_fetch_id = '0'
        }
    }
    const frt_data = await frtdb.sequelize.query(`select top 5000 DeviceLogId frt_log_id, DeviceId device_id, UserId user_id, LogDate log_date, C1 log_type, CreatedDate frt_created_date from DeviceLogs_${month}_${date.year} where DeviceLogId > ${max_fetch_id}  order by DeviceLogId`, { type: QueryTypes.SELECT });
    console.log(frt_data);
    if (!frt_data.length) {
    }
    const final_data = await Promise.all(
        frt_data.map(async item => {
            const frt_logs_insert = await awsdb.sequelize.query(`REPLACE INTO ceam_db.frt_logs (device_id, user_id, log_date, log_type, frt_created_date, frt_log_id) VALUES ('${item.device_id}','${item.user_id}','${item.log_date.toISOString().slice(0, 19).replace('T', ' ')}','${item.log_type}','${item.frt_created_date.toISOString().slice(0, 19).replace('T', ' ')}','${item.frt_log_id}');`, { type: QueryTypes.INSERT });
            console.log(frt_logs_insert);
        })
    )
    if (final_data) {
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'completed', last_run_date = now() where schedular_name = 'frt_logs_sync' and status = 'inprogress' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
    }
}
async function frtEmployeeSync() {
    const frt_employee_truncate = await awsdb.sequelize.query(`truncate table ceam_db.Employees`, { type: QueryTypes.INSERT });
    console.log(frt_employee_truncate);
    const frt_data = await frtdb.sequelize.query(`select * from Employees`, { type: QueryTypes.SELECT });
    console.log(frt_data);
    const final_data = await Promise.all(
        frt_data.map(async item => {
            const frt_logs_insert = await awsdb.sequelize.query(`REPLACE into ceam_db.Employees (EmployeeID, EmployeeName, EmployeeCode, Gender, DeviceId, Location, Status) values (${item.EmployeeId},'${item.EmployeeName}','${item.EmployeeCode}','${item.Gender}',${item.DeviceId},'${item.Location}','${item.Status}')`, { type: QueryTypes.INSERT });
            console.log(frt_logs_insert);
        })
    )
    if (final_data) {
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'completed', last_run_date = now() where schedular_name = 'frt_employee_sync' and status = 'inprogress' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
    }
}
async function frtDeviceSync() {
    const frt_device_truncate = await awsdb.sequelize.query(`truncate table ceam_db.Devices`, { type: QueryTypes.INSERT });
    console.log(frt_device_truncate);
    const frt_data = await frtdb.sequelize.query(`select * from Devices`, { type: QueryTypes.SELECT });
    //console.log(frt_data);
    const final_data = await Promise.all(
        frt_data.map(async item => {
            const frt_logs_insert = await awsdb.sequelize.query(`Replace into ceam_db.Devices (DeviceId, DeviceFName, SerialNumber, DeviceLocation) values (${item.DeviceId},'${item.DeviceFName}','${item.SerialNumber}','${item.DeviceLocation}')`, { type: QueryTypes.INSERT });
            console.log(frt_logs_insert);
        })
    )
    if (final_data) {
        const update_schedular_status = await awsdb.sequelize.query(`update schedular_status_master set status = 'completed', last_run_date = now() where schedular_name = 'frt_device_sync' and status = 'inprogress' and break_flag = false;`, { type: QueryTypes.UPDATE });
        console.log(update_schedular_status);
    }
}

function getdate() {
    var date = moment();

    var day = date.date();
    var month = date.month() + 1;
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    const year = date.year();
    const final_date = {
        day: day,
        month: month,
        year: year
    };
    return (final_date);
}
//frtDeviceSync()