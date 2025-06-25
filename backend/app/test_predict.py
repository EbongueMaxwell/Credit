import requests

url = "http://127.0.0.1:8000/predict"
data = {
    "age": 30,
    "income": 50000,
    "loanAmount": 20000,
    "time_in_business": 5,  # Example value
    "num_active_accounts": 3,  # Example value
    "prepayment_rate": 0.1,  # Example value
    "balance_week_4": 2000,  # Example value
    "balance_week_1": 1800,  # Example value
    "avg_balance_3_6months": 1750,  # Example value
    "has_guarantee": True,  # Example boolean value
    "internal_credit_score": 650,  # Example value
    "guarantee_type": "none",  # Example value
    "num_late_payments_past": 2,  # Example value
    "interest_rate": 3.5,  # Example value
    "balance_week_2": 1900,  # Example value
    "repayment_frequency": "monthly",  # Example value
    "remaining_debt_ratio": 0.25,  # Example value
    "balance_week_3": 1950,  # Example value
    "last_4weeks_movements": 3000,  # Example value
    "current_month_overdrafts": 0,  # Example value
    "avg_days_late_current": 1,  # Example value
    "overdraft_percentage": 10,  # Example value
    "num_late_payments_current": 0,  # Example value
    "current_week_movements": 1000,  # Example value
    "industry_sector": "retail",  # Example value
    "turnover": 40000,  # Example value
    "credit_type": "personal",  # Example value
    "unpaid_amount": 0,  # Example value
    "avg_days_late_past": 0,  # Example value
    "customer_tenure": 5,  # Example value
    "credit_duration": 12,  # Example duration in months
}

response = requests.post(url, json=data)
print(response.json())