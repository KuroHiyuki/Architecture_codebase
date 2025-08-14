/**
 * User Repository Implementation
 * MongoDB implementation of IUserRepository
 */
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UserModel } from '../database/schemas/UserSchema.js';

export class UserRepository extends IUserRepository {
  constructor({ logger }) {
    super();
    this.logger = logger;
  }

  async findById(id) {
    try {
      const userData = await UserModel.findById(id).exec();
      return userData ? this.mapToEntity(userData) : null;
    } catch (error) {
      this.logger.error('Error finding user by id', { id, error: error.message });
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const userData = await UserModel.findOne({ email: email.toLowerCase() }).exec();
      return userData ? this.mapToEntity(userData) : null;
    } catch (error) {
      this.logger.error('Error finding user by email', { email, error: error.message });
      throw error;
    }
  }

  async findByGoogleId(googleId) {
    try {
      const userData = await UserModel.findOne({ googleId }).exec();
      return userData ? this.mapToEntity(userData) : null;
    } catch (error) {
      this.logger.error('Error finding user by Google ID', { googleId, error: error.message });
      throw error;
    }
  }

  async emailExists(email) {
    try {
      const count = await UserModel.countDocuments({ email: email.toLowerCase() }).exec();
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking email existence', { email, error: error.message });
      throw error;
    }
  }

  async findAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const query = {};
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.role) query.role = filters.role;

      const [users, total] = await Promise.all([
        UserModel.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        UserModel.countDocuments(query).exec()
      ]);

      return {
        data: users.map(user => this.mapToEntity(user)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error finding users', { filters, pagination, error: error.message });
      throw error;
    }
  }

  async findActiveUsers(pagination = {}) {
    return this.findAll({ isActive: true }, pagination);
  }

  async save(entity, session = null) {
    try {
      const userData = this.mapToDocument(entity);
      
      const options = session ? { session } : {};
      const savedUser = await UserModel.create([userData], options);
      
      return this.mapToEntity(savedUser[0]);
    } catch (error) {
      this.logger.error('Error saving user', { 
        userId: entity.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async update(id, updateData, session = null) {
    try {
      const options = { new: true, session };
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        options
      ).exec();

      return updatedUser ? this.mapToEntity(updatedUser) : null;
    } catch (error) {
      this.logger.error('Error updating user', { id, error: error.message });
      throw error;
    }
  }

  async updateLastLogin(userId) {
    return this.update(userId, { lastLoginAt: new Date() });
  }

  async updatePassword(userId, hashedPassword) {
    return this.update(userId, { password: hashedPassword });
  }

  async delete(id) {
    try {
      const result = await UserModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.logger.error('Error deleting user', { id, error: error.message });
      throw error;
    }
  }

  async exists(id) {
    try {
      const count = await UserModel.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.logger.error('Error checking user existence', { id, error: error.message });
      throw error;
    }
  }

  async count(filters = {}) {
    try {
      const query = {};
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.role) query.role = filters.role;

      return await UserModel.countDocuments(query).exec();
    } catch (error) {
      this.logger.error('Error counting users', { filters, error: error.message });
      throw error;
    }
  }

  mapToEntity(userData) {
    return new User({
      id: userData._id,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: userData.isActive,
      role: userData.role,
      googleId: userData.googleId,
      lastLoginAt: userData.lastLoginAt
    });
  }

  mapToDocument(entity) {
    return {
      _id: entity.id,
      email: entity.email.value,
      password: entity.password,
      firstName: entity.firstName,
      lastName: entity.lastName,
      isActive: entity.isActive,
      role: entity.role,
      googleId: entity.googleId,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
