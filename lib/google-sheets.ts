import { google } from 'googleapis';

export interface SheetData {
  values: string[][];
}

class GoogleSheetsClient {
  private auth;
  private sheets;

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async getSheetData(range: string): Promise<SheetData> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
      });

      return {
        values: response.data.values || [],
      };
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw new Error('Failed to fetch sheet data');
    }
  }

  async updateSheetData(range: string, values: string[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error updating sheet data:', error);
      throw new Error('Failed to update sheet data');
    }
  }

  async appendSheetData(range: string, values: string[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Error appending sheet data:', error);
      throw new Error('Failed to append sheet data');
    }
  }
}

export const googleSheetsClient = new GoogleSheetsClient();
