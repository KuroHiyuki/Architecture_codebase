/**
 * User Repository Interface
 * Domain interface for user data access
 */
import { IRepository } from './IRepository.js';

export class IUserRepository extends IRepository {
  async findByEmail(email) {
    throw new Error('Method findByEmail must be implemented');
  }

  async findByGoogleId(googleId) {
    throw new Error('Method findByGoogleId must be implemented');
  }

  async emailExists(email) {
    throw new Error('Method emailExists must be implemented');
  }

  async findActiveUsers(pagination = {}) {
    throw new Error('Method findActiveUsers must be implemented');
  }

  async updateLastLogin(userId) {
    throw new Error('Method updateLastLogin must be implemented');
  }

  async updatePassword(userId, hashedPassword) {
    throw new Error('Method updatePassword must be implemented');
  }
}
