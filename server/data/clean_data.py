import pandas as pd
import csv
def clean_transactions():
    transactions = pd.read_csv('transactions.csv')
    categories = pd.read_csv('categories.csv')
    accounts = pd.read_csv('accounts.csv')
    # a couple dates exist in the dataset that actually do not exist (September 31st, and November 31st).
    # they will be removed for now, since it is unclear how these transactions ended up in the dataset.

    valid_september = ~transactions['date'].str.contains("-09-31")
    valid_november = ~transactions['date'].str.contains("-11-31")
    valid_transactions = valid_september & valid_november
    transactions = transactions[valid_transactions]

    cat_dict = {}
    for index, row in categories.iterrows():
        cat_dict[row['id']] = row['name']

    account_dict = {}
    bank_dict = {}
    for index, row in accounts.iterrows():
        account_dict[row['id']] = row['name']
        bank_dict[row['id']] = row['bank']

    transactions['category'] = ""
    transactions['bank'] = ""
    transactions['account'] = ""

    transactions["category"] = transactions["categoryId"].apply(lambda x: cat_dict.get(x))
    transactions["bank"] = transactions["accountId"].apply(lambda x: bank_dict.get(x))
    transactions["account"] = transactions["accountId"].apply(lambda x: account_dict.get(x))

    transactions[['id', 'reference', 'amount', 'currency',
       'date', 'category', 'bank', 'account']].to_csv('transactions_cleaned.csv', index=False, na_rep='') #quoting= csv.QUOTE_NONNUMERIC

clean_transactions()

