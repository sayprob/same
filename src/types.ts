export interface Donation {
  name: string;
  amount: number;
}

export interface DonationData {
  [key: string]: Donation[]; // key format: "YYYY-Month"
}

export interface ExcelRow {
  Year?: number;
  Month?: string;
  'Donor Name'?: string;
  'Donation Amount'?: number;
}

export interface Expense {
  date: string;
  amount: number;
  description: string;
}
