/**
 * Google Auth Command
 * Command for Google OAuth authentication
 */
import { ICommand } from '../ICommand.js';
import Joi from 'joi';

export class GoogleAuthCommand extends ICommand {
  constructor({ googleId, email, firstName, lastName }) {
    super();
    this.googleId = googleId;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  async validate() {
    const schema = Joi.object({
      googleId: Joi.string().required().messages({
        'any.required': 'Google ID is required'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required'
      }),
      firstName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      })
    });

    const { error } = schema.validate({
      googleId: this.googleId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    });

    if (error) {
      throw new Error(error.details[0].message);
    }
  }
}
