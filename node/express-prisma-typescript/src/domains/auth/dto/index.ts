import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator'

export class TokenDTO {
  token!: string
}

/**
 * @swagger
 * components:
 *  schemas:
 *    SignupInputDTO:
 *      tags:
 *        - auth
 *      properties:
 *        email:
 *          type: string
 *          description: the email of the user
 *        username:
 *          type: string
 *          description: the username, that will be shown to others
 *        password:
 *          type: string
 *          description: the password to log in with your user
 */
export class SignupInputDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
    email: string

  @IsString()
  @IsNotEmpty()
    username: string

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
    password: string

  constructor (email: string, username: string, password: string) {
    this.email = email
    this.password = password
    this.username = username
  }
}

/**
 * @swagger
 * components:
 *  schemas:
 *    LoginInputDTO:
 *      tags:
 *        - auth
 *      properties:
 *        email:
 *          type: string
 *          description: the email of the user
 *          required: false
 *        username:
 *          type: string
 *          description: the username, that will be shown to others
 *          required: false
 *        password:
 *          type: string
 *          description: the password to log in with your user
 */
export class LoginInputDTO {
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
    email?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
    username?: string

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
    password!: string
}
