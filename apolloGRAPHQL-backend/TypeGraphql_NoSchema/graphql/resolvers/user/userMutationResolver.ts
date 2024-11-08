import Parent from "../../../models/parent"; // Import the Parent model
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Region } from "../../../models/region";
import { redisClient } from "../../../config/redisDbTTL"; // Redis client for OTP
import { sendOTP } from "../../../utils/sendotp"; // Import your OTP service utility
import { sendEmail } from "../../../utils/emailHelper";
import { cleanUpExpiredTokens } from "../../../utils/tokenCleanup";
import { isEmail } from "../../../utils/isEmail";
import { UserCustomRequest } from "../../../types/customRequest";
import { clearUserTokens } from "../../../utils/clearUserToken";

// User Input
import { RegisterUserInput } from "../../../types/userInput";

export const userMutationResolver = {
  Mutation: {
    registerUser: async (_: any, { input }: { input: RegisterUserInput }) => {
      const {
        name,
        email,
        password,
        confirmPassword,
        phone,
        gender,
        region,
        dateOfBirth,
      } = input;

      try {
        const reg = await Region.findOne({ regionName: region });
        if (!reg) throw new Error("Region not found");

        if ( !phone ){
          throw new Error("enter phone number");
        }

        const existingParent = await Parent.findOne({
          $or: [{ email }, { phone }],
        });
        if (existingParent) throw new Error("Email or phone already in use");

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpKey = `otp:${phone}`;

        await redisClient.setEx(
          otpKey,
          300,
          JSON.stringify({
            otp: otp.toString(),
            name,
            email,
            phone,
            gender,
            region: reg._id,
            dateOfBirth,
            password,
          })
        );

        await sendOTP(phone, otp);

        return {
          message: "OTP sent to phone. Please verify to complete registration.",
          otpKey,
        };
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(`Error generating OTP: ${err.message}`);
        }
        throw new Error("Unknown error occurred");
      }
    },
  },
};
