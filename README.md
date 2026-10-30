# Ledger

A local-first personal finance site based on the Ledger screens in Figma.

## Run it

Install Node.js, then run `npm start` in this folder and open <http://127.0.0.1:4173>.

The site is served only on your computer. Transactions, budgets, goals, loans, wishlists, travel plans, completed trips, job profiles, salary records and settings are saved in this browser's local storage. The app has no account, server database, analytics, or external asset requests. Use **Settings → Export backup** to keep a portable copy, and **Import backup** to restore one.

Use **Work & salary** to record monthly pay by job. The default profile is Blinkit; save days worked, daily payout, overtime hours and hourly payout, other earnings and deductions. Salary totals are added to Transactions as linked income entries, and each month keeps its own rates. Add another job profile and switch to it if your work changes; earlier job records remain in salary history. The cash-flow chart displays only the selected month and stays empty when that month has no transactions.

The initial entries are editable sample data. **Settings → Restore starter data** replaces the browser's saved Ledger data with that sample again.

For managing finance and helping with finance decisions.
