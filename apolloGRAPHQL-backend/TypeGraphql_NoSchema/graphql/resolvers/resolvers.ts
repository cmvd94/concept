import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import Parent from '../../models/parent'; // Import the Parent model
//import { RegisterUserInput, VerifyOTPInput, RegisterUserResponse, 
import { RegisterUserInput, VerifyOTPInput, RegisterUserResponse, VerifyOTPResponse,  } from '../../types/userInput';
import { redisClient } from '../../config/redisDbTTL'; // Redis client for OTP
import { sendOTP } from '../../utils/sendotp';// Import your OTP service utility
import { sendEmail } from '../../utils/emailHelper';
import { Region } from '../../models/region'; // Import Region model

@Resolver()
export class UserResolver {
  @Mutation(() => RegisterUserResponse)
  async registerUser(
    @Arg('input') input: RegisterUserInput
  ): Promise<RegisterUserResponse> {
    const { name, email, password, confirmPassword, phone, gender, region, dateOfBirth } = input;

    try {
      const reg = await Region.findOne({ regionName: region });
      if (!reg) throw new Error("Region not found");

      if ( !phone ){
        throw new Error("please enter phone number");
      }

      const existingParent = await Parent.findOne({ $or: [{ email }, { phone }] });
      if (existingParent) throw new Error("Email or phone already in use");

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpKey = `otp:${phone}`;

      await redisClient.setEx(otpKey, 300, JSON.stringify({
        otp: otp.toString(),
        name,
        email,
        phone,
        gender,
        region: reg._id,
        dateOfBirth,
        password,
      }));

      await sendOTP(phone, otp);

      return {
        message: "OTP sent to phone. Please verify to complete registration.",
        otpKey,
      };
    } catch (err: unknown) {
      throw new Error(`Error generating OTP: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  }

  @Mutation(() => VerifyOTPResponse)
  async verifyOTP(
    @Arg('input') input: VerifyOTPInput
  ): Promise<VerifyOTPResponse> {
    const { otp, otpKey } = input;

    if ( !otp || otp.length !== 6){
      throw new Error("enter valid otp");
    }

    if ( !otpKey){
      throw new Error("enter valid otp");
    }

    try {
      const storedData = await redisClient.get(otpKey);
      if (!storedData) {
        throw new Error("OTP expired or invalid. Please try again.");
      }

      const {
        otp: storedOTP,
        name,
        email,
        phone,
        gender,
        region,
        dateOfBirth,
        password,
      } = JSON.parse(storedData);

      if (storedOTP !== otp) {
        throw new Error("Invalid OTP");
      }

      const newParent = new Parent({
        name,
        email,
        password, // Password hashing should be done in your model's pre-save middleware
        phone,
        gender,
        region,
        dateOfBirth: new Date(dateOfBirth),
        defaultChild: null, // Can be set later
        children: [], // Empty list initially
      });

      await newParent.save();

      const emailContent = {
        to: email,
        name,
        subject: "Account Created Successfully",
        text: `Hello ${name},\n\nYour account has been created successfully!\n\nBest regards,\nYour Team`,
        html: `<strong>Hello ${name},</strong><br><p>Your account has been created successfully!</p><p>Best regards,<br>Your Team</p>`,
      };``

      await sendEmail(emailContent); // Send the email
      await redisClient.del(otpKey); // Delete the OTP and user data from Redis after successful verification

      return { message: "User registered successfully." };
    } catch (err: unknown) {
      throw new Error(`Error verifying OTP: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    }
  }
}

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello(): string {
    return "Hello, world!";
  }
}
