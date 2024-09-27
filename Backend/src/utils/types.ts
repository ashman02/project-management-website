export interface RegisterUserPayload {
    username : string
    email : string
    password : string
    fullName? : string
}

export interface VerifyUserPayload {
    verifyCode : string
    username : string
}

export interface JwtGeneratePayload  {
    _id : string
    username : string
    email : string
    fullName? : string
}

export interface loginPayload {
    username? : string
    email? : string
    password : string
}