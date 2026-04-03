from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import send_sms_otp, generate_otp, store_otp, verify_otp_logic, register_user, is_user_registered

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    mobile: str
    designation: str
    department: str

class SendOTPRequest(BaseModel):
    phone_number: str

class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str

@router.post("/api/auth/signup")
def signup_endpoint(request: SignupRequest):
    register_user(request.name, request.mobile, request.designation, request.department)
    return {"status": "success", "message": "User registered successfully"}

@router.post("/api/auth/send-otp")
def send_otp_endpoint(request: SendOTPRequest):
    phone_number = request.phone_number
    
    # Login Security Check Phase A
    if not is_user_registered(phone_number):
        # Prevent login for unknown users
        raise HTTPException(status_code=404, detail="User not registered. Please sign up first.")
        
    otp = generate_otp()
    
    # Store OTP in memory dictionary
    store_otp(phone_number, otp)
    
    # Send SMS via Twilio
    result = send_sms_otp(phone_number, otp)
    
    return {
        "success": True,
        "message": f"OTP processed for {phone_number}", 
        "twilio_status": result
    }

@router.post("/api/auth/verify-otp")
def verify_otp_endpoint(request: VerifyOTPRequest):
    is_valid = verify_otp_logic(request.phone_number, request.otp)
    
    if is_valid:
        return {"success": True, "message": "Authentication successful"}
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
