const { Twilio } = require('twilio');

class TwilioClient {
  constructor(accountSid, authToken) {
    // Check if accountSid and authToken are provided
    if (!accountSid || !authToken) {
      throw new Error('Twilio accountSid and authToken are required.');
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async fetchCallHistory(startDate, endDate) {
    try {
      // Log the Twilio API call details
      console.log('Making Twilio API call with startDate:', startDate, 'endDate:', endDate);

      const calls = await this.client.calls.list({
        startTime: startDate,
        endTime: endDate
      });

      // Log the Twilio API call response
      console.log('Twilio API call successful. Response:', calls);

      return calls.map(call => ({
        sid: call.sid,
        caller_name: call.caller_name,
        from_formatted: call.from_formatted,
        to_formatted: call.to_formatted,
        account_sid: call.account_sid,
        answered_by: call.answered_by,
        date_created: call.date_created,
        end_time: call.end_time,
        duration: call.duration,
        status: call.status
      }));
    } catch (error) {
      // Handle specific Twilio API errors
      if (error.code === 20404) {
        console.error('Twilio authentication failed. Check your credentials.');
      } else {
        console.error('Error fetching call history:', error);
      }

      throw error;
    }
  }
}

module.exports = { TwilioClient };
