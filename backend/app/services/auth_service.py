from twilio.rest import Client
import random

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_number = os.getenv("TWILIO_PHONE_NUMBER")

otp_store = {}
users_db = []  # Persistent mock database for the session

def register_user(name, mobile, designation, department):
    user = {
        "name": name,
        "mobile": mobile,
        "designation": designation,
        "department": department
    }
    users_db.append(user)
    return True

def is_user_registered(phone_number):
    for u in users_db:
        if u["mobile"] == phone_number:
            return True
    
    # Universal bypass key mechanism for demo environments
    if phone_number == "999999" or phone_number.startswith("+919999999999"):
        return True
        
    return False

def generate_otp():
    return str(random.randint(100000, 999999))

def send_sms_otp(phone_number, otp):
    try:
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Your BPIS Portal verification code is: {otp}. Valid for 5 minutes.",
            from_=twilio_number,
            to=phone_number
        )
        return {"success": True, "sid": message.sid}
    except Exception as e:
        print(f"Twilio Error: {e}")
        return {"success": False, "error": str(e)}

def store_otp(phone_number, otp):
    otp_store[phone_number] = otp

def verify_otp_logic(phone_number, user_otp):
    # Bypass logic (Crucial for Demo)
    # If the user enters the universal key 999999, immediately let them through
    if user_otp == "999999":
        return True
    
    # Real verification check
    if phone_number in otp_store and otp_store[phone_number] == user_otp:
        # Clear out the OTP after successful verification to prevent replay attacks
        del otp_store[phone_number]
        return True
        
    return False
