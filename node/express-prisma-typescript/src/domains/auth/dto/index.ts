import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator'

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
 *        name:
 *          type: string
 *          description: The name of the use, is an optional value
 *        password:
 *          type: string
 *          description: the password to log in with your user
 *        privateUser:
 *          type: boolean
 *          description: if the user will be private or not
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
    name?: string

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
    password: string

  @IsBoolean()
  @IsNotEmpty()
    privateUser: boolean

  constructor (email: string, username: string, password: string, privateUser: boolean, name?: string) {
    this.email = email
    this.password = password
    this.username = username
    this.name = name
    this.privateUser = privateUser
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
 *          example: "test-mail2@gmail.com"
 *        username:
 *          type: string
 *          description: the username, that will be shown to others
 *          required: false
 *          example: "test2"
 *        password:
 *          type: string
 *          description: the password to log in with your user
 *          example: "Test1-plot-armor"
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
