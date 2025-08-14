/**
 * Login User Command
 * Command for user authentication
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class LoginUserCommand extends ICommand {
  constructor({ email, password }) {
    super();
    this.email = email;
    this.password = password;
  }

  async validate() {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required'
      })
    });

    const { error } = schema.validate({
      email: this.email,
      password: this.password
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
