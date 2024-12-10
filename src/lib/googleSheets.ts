import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '1QHbngOGAJJf3aDQReCU79ZLnC_WQp56M_-hbRc_ZQbI';
const SHEET_NAME = 'Registrations';

// Service account credentials
const credentials = {
  type: 'service_account',
  project_id: 'exp32024',
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CERT_URL
};

interface RegistrationData {
  timestamp: string;
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  status: string;
}

class GoogleSheetsService {
  private auth: JWT;
  private sheets: ReturnType<typeof google.sheets>;

  constructor() {
    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async initializeSheet() {
    try {
      // Check if sheet exists
      await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      });

      // Set up headers if needed
      const headers = [
        'Timestamp',
        'User Email',
        'User Name',
        'Event Title',
        'Event Date',
        'Status'
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });

      return true;
    } catch (error) {
      console.error('Error initializing sheet:', error);
      return false;
    }
  }

  async appendRegistration(data: RegistrationData) {
    try {
      const values = [
        [
          data.timestamp,
          data.userEmail,
          data.userName,
          data.eventTitle,
          data.eventDate,
          data.status
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:F`,
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      return { error: null };
    } catch (error) {
      console.error('Error appending registration:', error);
      return { error: 'Failed to record registration in Google Sheets' };
    }
  }
}

export const sheetsService = new GoogleSheetsService();