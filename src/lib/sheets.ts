import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '1YourSpreadsheetIDHere';
const SHEET_ID = 0; // First sheet

const credentials = {
  type: "service_account",
  project_id: "exp32024",
  private_key_id: "d279582dd4be922b94a66d6e02edfd43efdba383",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMFxog6V61XU9U\nDl6vzs6y5KXooexix6KW8HQHqqCCgp76dtp1dqk+XhSt0tZdrVM3wTJ+zSjTtGK+\npZf7Acg/gcaqv2N9DsQyN0/H9Sx5LLvuOhajd82zRUuzGKgBS6oQgkxFxNCyfxVQ\nL5h5pQwl7LrUVMHbQqCkFu+Udo3O5y5aEtRDdW44NidZricVsMtU8CX7U89uGHTs\nXQYul4RghIUzDka/oFzGQ9GK3VVUQhq8xXm3Nbbxjl2+hXbMbBQd8mUbX3r6ZEGx\nUcJT55FbxIHINrUJLkKnY17i0h5pB9v5oJxRRjQYNTCLJF8ASXH0l1+bda3UbLQo\nFc1dCNwDAgMBAAECggEAEPZuloOu+nX57OuQ1R3kMhws6evjYMZk7hSoICb/VjmT\nCxAr0g19vZBGObhHVtvcCctF7iIRHZ9lgaDzw8n/IcAgifqEQ1Wh2uab++uVubCN\nIhyz2vxPHXJJ+2W2OP1X8i1SN45HJj7Hv7Vk/99G5jQJxzIQNrAP9/NsEDPWT3bj\nXjeM67OMxeZ0m1NGWStjnJLMbW6kPwUfzMbeesKDa0SivYb9n1IupBE4sTQyM7zK\nfNDxqGUBos7lplJ1PW4OX3kQZx5eUSXP259RAGLxODYJDDY0huXuCrH93DZLIq8S\n+cw3nNmjwQVPAoR8yEic3toxSjHOH9jFPW2dMXUgsQKBgQD05iUlLWChgnOJ2P0t\nlbFmW2I15+C3uU//pFly1BmTwYxeqTfNCvAMg/UtItQr+KyepHksR/mjJ6hlsB1J\nLDvnnV5KG07yMD/bl9sj1/ts0sKBB+jTSm2BF8CljlOPCONAjkiOQlUA0vLKOyG9\nTLAOyutwmf+xcySbQsHviYDUSQKBgQDVV2d/Ru/6RvlwQOuMxZ1RtQ7+xo6aDGrk\nk/qWPOIhyqDTxET2JI3RiiyUaC6Zo9IaHy/AkIZ5aGYQoEjl3VGxY4NVOP2Gypsp\n08GxcDj03yTRCUfg2OjZOAd2WQvGFSu4SEYtHwD2nJRQ+8QQEH8Pn/angMZikh4r\nr5F/x3wV6wKBgDkSfWuZlKBvD0/7spzx+sK43z1iyXrng942xeW9yiwl+fmBhBCT\n0PeJtRSMvld0/32FJPwN1f6Q2mzAS0LnPRqwEO5CSPamCeu6CwbiaaSlxVBesIK1\nIKnqCCpM7eoyjwtXXU9R5A9qGczJVQaRnaIE5jN6oB0RkWFhgGK7b7uJAoGADy7B\nNtWdjnoulkaIfOQzZfU0s/z9eQkZMls1oiuDDFSXTXrSTZIcZaUntwgTCOwXr7Q4\necPPTiSX3ucJSRKPFci3OAFuSYFxuXBQgIg0BXk77YRzkRTevVa3cTy1Ecu/6MV7\n+QoTz3klNP413c7OvBXuP81yUOGFNCayfB1+PzECgYEA4x8dp8wy+NRnCxQ5cLtA\nhWhNMbZnkD5PzOrRc2gQkLTg6r/xYw29LPzx8n6jjBwv/XpULPakriuVm49Fl5SS\nIIY3HkjV0Edew09fQUZImIeO66viXThm7RFGdnbpJQwlH8EaCoYrDbYU0Mufch5e\nuUD08aaLKBEKRvUpfGBeROk=\n-----END PRIVATE KEY-----\n",
  client_email: "exp3user-data@exp32024.iam.gserviceaccount.com",
  client_id: "113245807182807648446",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/exp3user-data%40exp32024.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

interface RegistrationData {
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
}

class SheetsService {
  private doc: GoogleSpreadsheet;
  private initialized: boolean = false;

  constructor() {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  }

  private async init() {
    if (!this.initialized) {
      await this.doc.loadInfo();
      this.initialized = true;
    }
  }

  async appendRegistration(data: RegistrationData) {
    try {
      await this.init();
      
      const sheet = this.doc.sheetsById[SHEET_ID];
      
      // Ensure headers exist
      const headers = [
        'Timestamp',
        'User ID',
        'User Name',
        'User Email',
        'Event ID',
        'Event Title',
        'Event Date'
      ];

      // Check if headers need to be added
      const rows = await sheet.getRows();
      if (rows.length === 0) {
        await sheet.setHeaderRow(headers);
      }

      // Append the new registration data
      await sheet.addRow({
        'Timestamp': data.timestamp,
        'User ID': data.userId,
        'User Name': data.userName,
        'User Email': data.userEmail,
        'Event ID': data.eventId,
        'Event Title': data.eventTitle,
        'Event Date': data.eventDate
      });

      return { error: null };
    } catch (error) {
      console.error('Error appending registration to sheet:', error);
      return { error: 'Failed to append registration to sheet' };
    }
  }
}

export const sheetsService = new SheetsService();