const API_BASE_URL = 'https://680e984c67c5abddd1928dc7.mockapi.io/api/v1';

let expenseCache: {
    [userId: string]: {
        data: Expense[];
        timestamp: number;
    }
} = {};

const CACHE_EXPIRATION = 5 * 60 * 1000;

export interface Expense {
    id: string;
    userId: string;
    title: string;
    amount: number;
    date: Date | string;
    createdAt: string;
}

export async function fetchExpenses(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    forceRefresh = false
): Promise<Expense[]> {
    try {
        const now = Date.now();
        const cachedData = expenseCache[userId];
        const isCacheValid = cachedData &&
            (now - cachedData.timestamp < CACHE_EXPIRATION) &&
            !forceRefresh;

        if (isCacheValid) {
            console.log('Using cached expense data');
            let result = cachedData.data;

            if (startDate && endDate) {
                result = filterExpensesByDate(result, startDate, endDate);
            }

            return result;
        }

        const url = `${API_BASE_URL}/expenses?userId=${userId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
        });

        if (response.status === 404) {
            console.log('No expenses found for this user');
            return [];
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to fetch expenses: ${response.status} ${response.statusText}`);
        }

        const expenses = await response.json();

        const formattedExpenses = expenses.map((expense: any) => ({
            ...expense,
            amount: Number(expense.amount),
            date: new Date(expense.date)
        }));

        expenseCache[userId] = {
            data: formattedExpenses,
            timestamp: now
        };

        if (startDate && endDate) {
            return filterExpensesByDate(formattedExpenses, startDate, endDate);
        }

        return formattedExpenses;
    } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
            console.error("Error fetching expenses:", error);
            throw error;
        }
        return [];
    }
}

function filterExpensesByDate(expenses: Expense[], startDate: Date, endDate: Date): Expense[] {
    return expenses.filter((expense: Expense) => {
        const expenseDate = expense.date instanceof Date
            ? expense.date
            : new Date(expense.date);

        return expenseDate >= startDate && expenseDate <= endDate;
    });
}

export async function addExpense(expense: {
    userId: string;
    amount: number;
    title: string;
    date: Date;
}): Promise<string> {
    try {
        const expenseData = {
            userId: expense.userId,
            title: expense.title,
            amount: expense.amount,
            date: expense.date.toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to add expense: ${response.status} ${response.statusText}`);
        }

        const newExpense = await response.json();

        if (expenseCache[expense.userId]) {
            delete expenseCache[expense.userId];
        }

        return newExpense.id;
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
}

export async function deleteExpense(expenseId: string): Promise<Expense> {
    try {
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`Failed to delete expense: ${response.status} ${response.statusText}`);
        }

        const deletedExpense = await response.json();

        expenseCache = {};

        return deletedExpense;
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
}

export function invalidateCache(userId?: string): void {
    if (userId) {
        delete expenseCache[userId];
    } else {
        expenseCache = {};
    }
}