const express = require('express');
const cors = require('cors');
const path = require('path');
const { DateTime } = require('luxon');
const { TwilioClient } = require('./twilio-client');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 5000;

require('dotenv').config();

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'twilio-call-history/build')));

const twilioClient = new TwilioClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get('/fetch-call-history', async (req, res) => {
  const startDate = DateTime.fromISO(req.query.startDate).toUTC().toISO();
  const endDate = DateTime.fromISO(req.query.endDate).endOf('day').toUTC().toISO();

  console.log('startDate:', startDate);
  console.log('endDate:', endDate);

  try {
    // Validate date strings
    if (!DateTime.fromISO(startDate).isValid || !DateTime.fromISO(endDate).isValid) {
      throw new Error('Invalid date format');
    }

    const callHistory = await twilioClient.fetchCallHistory(startDate, endDate);
    res.json(callHistory);
  } catch (error) {
    console.error('Error fetching call history:', error.message);
    res.status(400).json({ error: 'Invalid date format or other request error' });
  }
});

app.post('/fetch-call-history', async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const callHistory = await twilioClient.fetchCallHistory(startDate, endDate);
    res.json(callHistory);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/export-to-excel', async (req, res) => {
  const startDate = DateTime.fromISO(req.query.startDate).toUTC().toISO();
  const endDate = DateTime.fromISO(req.query.endDate).endOf('day').toUTC().toISO();

  console.log('Exporting call history to Excel from', startDate, 'to', endDate);

  try {
    const callHistory = await twilioClient.fetchCallHistory(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Call History');
    worksheet.addRow(['Call SID', 'Caller Name', 'From (Formatted)', 'To (Formatted)', 'Account SID', 'Answered By', 'Date Created', 'End Time', 'Duration', 'Status']);

    callHistory.forEach(call => {
      const row = [
        call.sid,
        call.caller_name || '',
        call.from_formatted,
        call.to_formatted,
        call.account_sid,
        call.answered_by,
        DateTime.fromISO(call.date_created).toLocaleString(DateTime.DATETIME_SHORT),
        call.end_time,
        call.duration,
        call.status
      ];

      worksheet.addRow(row);
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    res.attachment('call_history.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/export-to-excel', async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const callHistory = await twilioClient.fetchCallHistory(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Call History');
    worksheet.addRow(['Call SID', 'Caller Name', 'From (Formatted)', 'To (Formatted)', 'Account SID', 'Answered By', 'Date Created', 'End Time', 'Duration', 'Status']);

    callHistory.forEach(call => {
      const row = [
        call.sid,
        call.caller_name || '',
        call.from_formatted,
        call.to_formatted,
        call.account_sid,
        call.answered_by,
        DateTime.fromISO(call.date_created).toLocaleString(DateTime.DATETIME_SHORT),
        call.end_time,
        call.duration,
        call.status
      ];

      worksheet.addRow(row);
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    res.attachment('call_history.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'twilio-call-history/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
