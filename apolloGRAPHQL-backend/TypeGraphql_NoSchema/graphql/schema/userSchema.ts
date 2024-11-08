import { gql } from "graphql-tag";

export const userSchema = gql`
  type Sem {
    semesterName: String
  }

  type RegionGrade {
    gradeId: ID!
    gradeName: String!
    sem: [Sem!]! 
  }

  type Region {
    _id: ID!
    regionName: String!
    grades: [RegionGrade!]!
  }

  input RegisterUserInput {
    name: String!
    email: String!
    password: String!
    confirmPassword: String!
    phone: String!
    gender: String!
    region: String!
    dateOfBirth: String!
  }

  type RegisterUserResponse {
    message: String!
    otpKey: String!
  }

  input VerifyOTPInput {
    otp: String!
    otpKey: String!
  }

  type VerifyOTPResponse {
    message: String!
  }
  type Mutation {
    registerUser(input: RegisterUserInput!): RegisterUserResponse
    verifyOTP(input: VerifyOTPInput!): VerifyOTPResponse!
  }

  type Query {
    allRegions: [Region!]!
  }
`;
