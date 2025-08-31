import { DonationData, Donation, Expense } from '../types';

const DONATIONS_URL = 'https://sayprob.github.io/website-for-yassin/src/data/donations.json';
const EXPENSES_URL = 'https://sayprob.github.io/website-for-yassin/src/data/expenses.json';

// Replace with your GitHub token
const GITHUB_TOKEN = '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';
const REPO_OWNER = 'sayprob';
const REPO_NAME = 'website-for-yassin';
const BRANCH = 'main';

// Verify GitHub token permissions
async function verifyGitHubToken(): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub token verification failed:', errorText);
      return false;
    }

    const userData = await response.json();
    console.log('GitHub token verified for user:', userData.login);

    // Check if token has repo scope
    const tokenScopes = response.headers.get('X-OAuth-Scopes');
    if (!tokenScopes || !tokenScopes.includes('repo')) {
      console.error('GitHub token is missing required "repo" scope');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying GitHub token:', error);
    return false;
  }
}

async function updateGitHubFile(filePath: string, content: string): Promise<void> {
  // First verify the token
  const tokenValid = await verifyGitHubToken();
  if (!tokenValid) {
    throw new Error('GitHub token is invalid, lacks required permissions, or is missing "repo" scope');
  }

  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

  try {
    // Get current file SHA
    const getResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Failed to get file: ${getResponse.status} ${getResponse.statusText}. Response: ${errorText}`);
    }

    const fileData = await getResponse.json();
    const currentSHA = fileData.sha;

    // Update file
    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update ${filePath}`,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: currentSHA,
        branch: BRANCH
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update file: ${updateResponse.status} ${updateResponse.statusText}. Response: ${errorText}`);
    }

    console.log(`Successfully updated ${filePath} on GitHub`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    throw error; // Re-throw to maintain error handling in calling functions
  }
}

export const saveDonationsToFile = async (donations: DonationData): Promise<void> => {
  try {
    const content = JSON.stringify(donations, null, 2);

    // Save to localStorage
    localStorage.setItem('donations', content);
    console.log('Donations saved to localStorage');

    // Update GitHub file
    await updateGitHubFile('src/data/donations.json', content);
    console.log('Donations data saved successfully to GitHub');
  } catch (error) {
    console.error('Error saving donations:', error);
    // Fallback to localStorage if GitHub fails
    localStorage.setItem('donations', JSON.stringify(donations, null, 2));
    console.log('Fallback: Donations saved to localStorage only');
    throw new Error(`Failed to save donations to GitHub: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const loadDonationsFromFile = async (): Promise<DonationData> => {
  try {
    // First try to load from the GitHub Pages URL
    const response = await fetch(DONATIONS_URL);
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded donations from GitHub Pages');
      return data as DonationData;
    }

    // Fallback to localStorage if GitHub fetch fails
    const stored = localStorage.getItem('donations');
    if (stored) {
      console.log('Loaded donations from localStorage');
      return JSON.parse(stored);
    }

    // Final fallback to local JSON file
    const { default: donationsData } = await import('../data/donations.json');
    console.log('Loaded donations from local file');
    return donationsData as DonationData;
  } catch (error) {
    console.error('Error loading donations:', error);

    // Try localStorage as final fallback
    try {
      const stored = localStorage.getItem('donations');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (storageError) {
      console.error('Error loading from localStorage:', storageError);
    }

    return {};
  }
};

export const loadExpensesFromFile = async (): Promise<Expense[]> => {
  try {
    // First try to load from the GitHub Pages URL
    const response = await fetch(EXPENSES_URL);
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded expenses from GitHub Pages');
      return data as Expense[];
    }

    // Fallback to localStorage if GitHub fetch fails
    const stored = localStorage.getItem('expenses');
    if (stored) {
      console.log('Loaded expenses from localStorage');
      return JSON.parse(stored);
    }

    // Final fallback to local JSON file
    const { default: expensesData } = await import('../data/expenses.json');
    console.log('Loaded expenses from local file');
    return expensesData as Expense[];
  } catch (error) {
    console.error('Error loading expenses:', error);

    // Try localStorage as final fallback
    try {
      const stored = localStorage.getItem('expenses');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (storageError) {
      console.error('Error loading from localStorage:', storageError);
    }

    return [];
  }
};

export const saveExpensesToFile = async (expenses: Expense[]): Promise<void> => {
  try {
    const content = JSON.stringify(expenses, null, 2);

    // Save to localStorage
    localStorage.setItem('expenses', content);
    console.log('Expenses saved to localStorage');

    // Update GitHub file
    await updateGitHubFile('src/data/expenses.json', content);
    console.log('Expenses data saved successfully to GitHub');
  } catch (error) {
    console.error('Error saving expenses:', error);
    // Fallback to localStorage if GitHub fails
    localStorage.setItem('expenses', JSON.stringify(expenses, null, 2));
    console.log('Fallback: Expenses saved to localStorage only');
    throw new Error(`Failed to save expenses to GitHub: ${error instanceof Error ? error.message : String(error)}`);
  }
};
