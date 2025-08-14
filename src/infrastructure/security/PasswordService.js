/**
 * Password Service
 * Handles password hashing and validation
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class PasswordService {
  constructor({ logger }) {
    this.logger = logger;
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  }

  async hashPassword(password) {
    try {
      if (!password) {
        throw new Error('Password is required');
      }

      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      this.logger.debug('Password hashed successfully');
      
      return hashedPassword;
    } catch (error) {
      this.logger.error('Error hashing password', { error: error.message });
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(password, hashedPassword) {
    try {
      if (!password || !hashedPassword) {
        throw new Error('Password and hash are required');
      }

      const isValid = await bcrypt.compare(password, hashedPassword);
      this.logger.debug('Password verification completed', { isValid });
      
      return isValid;
    } catch (error) {
      this.logger.error('Error verifying password', { error: error.message });
      throw new Error('Failed to verify password');
    }
  }

  generateRandomPassword(length = 12) {
    try {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
      let password = '';
      
      // Ensure at least one character from each required type
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const special = '@#$%^&*';
      
      password += lowercase[crypto.randomInt(lowercase.length)];
      password += uppercase[crypto.randomInt(uppercase.length)];
      password += numbers[crypto.randomInt(numbers.length)];
      password += special[crypto.randomInt(special.length)];
      
      // Fill the rest randomly
      for (let i = 4; i < length; i++) {
        password += charset[crypto.randomInt(charset.length)];
      }
      
      // Shuffle the password
      return password.split('').sort(() => Math.random() - 0.5).join('');
    } catch (error) {
      this.logger.error('Error generating random password', { error: error.message });
      throw new Error('Failed to generate random password');
    }
  }

  validatePasswordStrength(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password cannot exceed 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  generatePasswordResetToken() {
    try {
      return crypto.randomBytes(32).toString('hex');
    } catch (error) {
      this.logger.error('Error generating password reset token', { error: error.message });
      throw new Error('Failed to generate password reset token');
    }
  }

  hashResetToken(token) {
    try {
      return crypto.createHash('sha256').update(token).digest('hex');
    } catch (error) {
      this.logger.error('Error hashing reset token', { error: error.message });
      throw new Error('Failed to hash reset token');
    }
  }
}
