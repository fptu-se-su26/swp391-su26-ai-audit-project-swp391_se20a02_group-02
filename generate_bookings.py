import re
import uuid
import random
from datetime import datetime, timedelta

# Read the SQL file to get vehicles
with open('import-data.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

vehicles = []
for line in lines:
    if 'INSERT INTO vehicles' in line:
        # Extract id, price_per_day, owner_id
        match_id = re.search(r"VALUES \('([^']+)'", line)
        if not match_id: continue
        vid = match_id.group(1)
        
        # Split by comma to get owner_id (it is the second to last column, or just search for owner-user)
        match_owner = re.search(r"'(owner-[^']+)'", line)
        owner_id = match_owner.group(1) if match_owner else 'owner-user-id-003'
        
        match_price = re.search(r"(\d+\.\d{2})", line)
        price = float(match_price.group(1)) if match_price else 500000.0
        
        vehicles.append({'id': vid, 'owner_id': owner_id, 'price': price})

if len(vehicles) < 7:
    print("Not enough vehicles")
    exit(1)

random.shuffle(vehicles)
selected = vehicles[:7]

renter_id = 'customer-nguyen-van-a'

statuses = [
    'CONFIRMED', 'COMPLETED', 'PAYMENT_PENDING', 'CANCELLED', 'OWNER_APPROVED', 'COMPLETED', 'CONFIRMED'
]

output = []
for i, v in enumerate(selected):
    b_id = str(uuid.uuid4())
    p_id = str(uuid.uuid4())
    days = random.randint(2, 6)
    
    # Dates
    if statuses[i] == 'COMPLETED':
        start_date = datetime.now() - timedelta(days=random.randint(10, 30))
    elif statuses[i] == 'CONFIRMED' or statuses[i] == 'OWNER_APPROVED':
        start_date = datetime.now() + timedelta(days=random.randint(2, 10))
    else:
        start_date = datetime.now() + timedelta(days=random.randint(1, 5))
        
    end_date = start_date + timedelta(days=days)
    
    # Calculate pricing
    base_price = v['price'] * days
    service_fee = base_price * 0.1
    taxes = base_price * 0.08
    deposit = v['price'] * 2
    total = base_price + service_fee + taxes
    
    b_code = f"LXW-26-DEMO{i+1}"
    
    created_at = (start_date - timedelta(days=random.randint(1, 5))).strftime('%Y-%m-%d %H:%M:%S.000000')
    start_str = start_date.strftime('%Y-%m-%d %H:%M:%S.000000')
    end_str = end_date.strftime('%Y-%m-%d %H:%M:%S.000000')
    
    b_sql = f"INSERT INTO bookings ([id], [addons_total], [base_price], [cancellation_reason], [cancelled_at], [check_in_odometer], [check_out_odometer], [coupon_code], [created_at], [damage_report], [delivery_address], [delivery_fee], [deposit], [deposit_refunded], [discount], [dropoff_lat], [dropoff_lng], [end_date], [estimated_time], [include_delivery], [include_insurance], [insurance_fee], [notes], [owner_notes], [pickup_lat], [pickup_lng], [pickup_location], [price_per_day], [route_distance], [route_polyline], [service_fee], [start_date], [status], [taxes], [total], [total_days], [updated_at], [owner_id], [renter_id], [vehicle_id], [booking_code], [cleaning_fee], [version]) VALUES ('{b_id}', 0.00, {base_price:.2f}, NULL, NULL, NULL, NULL, NULL, '{created_at}', NULL, 'Demo Address', 0.00, {deposit:.2f}, 0, 0.00, NULL, NULL, '{end_str}', NULL, 0, 0, 0.00, 'Demo booking for presentation', NULL, NULL, NULL, 'Demo Pickup Location', {v['price']:.2f}, NULL, NULL, {service_fee:.2f}, '{start_str}', '{statuses[i]}', {taxes:.2f}, {total:.2f}, {days}, '{created_at}', '{v['owner_id']}', '{renter_id}', '{v['id']}', '{b_code}', 0, 1);"
    output.append(b_sql)
    
    # Also create payments
    pay_status = 'COMPLETED' if statuses[i] in ['CONFIRMED', 'COMPLETED', 'OWNER_APPROVED'] else 'PENDING'
    if statuses[i] == 'CANCELLED': pay_status = 'REFUNDED'
    
    p_sql = f"INSERT INTO payments ([id], [amount], [created_at], [currency], [error_message], [payment_date], [payment_method], [status], [transaction_id], [updated_at], [booking_id]) VALUES ('{p_id}', {total:.2f}, '{created_at}', 'VND', NULL, '{created_at}', 'BANK_TRANSFER', '{pay_status}', 'TXN-{b_code}', '{created_at}', '{b_id}');"
    output.append(p_sql)

with open('import-data.sql', 'a', encoding='utf-8') as f:
    f.write('\n\n-- DEMO BOOKINGS --\n')
    for line in output:
        f.write(line + '\n')
print("Successfully generated 7 demo bookings")
