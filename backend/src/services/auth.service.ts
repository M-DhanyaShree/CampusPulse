import { User, IUser } from '../models/User.model.js';
import { UserRole } from '../constants/roles.js';
import { generateToken } from '../utils/token.js';
import { Department } from '../models/Department.model.js';
import { Types } from 'mongoose';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  departmentId?: string;
  studentId?: string;
  phoneNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // Default role is Student unless registered by an admin
    const role = dto.role || UserRole.STUDENT;

    // Validate department if provided
    let departmentId = null;
    if (dto.departmentId) {
      const dept = await Department.findById(dto.departmentId);
      if (dept) {
        departmentId = dept._id;
      }
    }

    const user = await User.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: dto.password,
      role,
      departmentId,
      studentId: dto.studentId,
      phoneNumber: dto.phoneNumber,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ? user.departmentId.toString() : null,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, token };
  }

  async login(dto: LoginDto) {
    const user = await User.findOne({ email: dto.email.toLowerCase() })
      .select('+password')
      .populate('departmentId', 'name code');

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact the administrator.');
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ? (user.departmentId as any)._id?.toString() || user.departmentId.toString() : null,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, token };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId)
      .populate('departmentId', 'name code categories buildingLocation')
      .lean();
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new Error('Current password is incorrect.');
    }

    user.password = newPass;
    await user.save();
    return true;
  }

  async listUsers(query: { role?: string; departmentId?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.role) filter.role = query.role;
    if (query.departmentId) filter.departmentId = new Types.ObjectId(query.departmentId);
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { studentId: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('departmentId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, newRole: UserRole, departmentId?: string) {
    const update: any = { role: newRole };
    if (departmentId !== undefined) {
      update.departmentId = departmentId ? new Types.ObjectId(departmentId) : null;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true })
      .populate('departmentId', 'name code')
      .lean();

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}

export const authService = new AuthService();
