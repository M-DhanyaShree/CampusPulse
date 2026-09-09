import { Types } from 'mongoose';
import { Department, IDepartment } from '../models/Department.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { ComplaintStatus } from '../constants/complaint.js';

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  categories: string[];
  slaHoursDefault?: number;
  contactEmail?: string;
  contactPhone?: string;
  buildingLocation?: string;
}

export class DepartmentService {
  async createDepartment(dto: CreateDepartmentDto): Promise<IDepartment> {
    const existing = await Department.findOne({
      $or: [{ name: dto.name }, { code: dto.code.toUpperCase() }],
    });

    if (existing) {
      throw new Error('A department with this name or code already exists.');
    }

    return Department.create({
      ...dto,
      code: dto.code.toUpperCase(),
      headOfDepartment: dto.headOfDepartment ? new Types.ObjectId(dto.headOfDepartment) : null,
    });
  }

  async getAllDepartments(activeOnly = true) {
    const filter = activeOnly ? { isActive: true } : {};
    return Department.find(filter)
      .populate('headOfDepartment', 'name email role')
      .sort({ name: 1 })
      .lean();
  }

  async getDepartmentById(id: string) {
    const dept = await Department.findById(id)
      .populate('headOfDepartment', 'name email role')
      .lean();

    if (!dept) {
      throw new Error('Department not found.');
    }

    // Attach current ticket workload
    const [openTickets, resolvedTickets, highUrgencyTickets] = await Promise.all([
      Complaint.countDocuments({
        departmentId: new Types.ObjectId(id),
        status: { $in: [ComplaintStatus.SUBMITTED, ComplaintStatus.IN_PROGRESS, ComplaintStatus.TRIAGED] },
      }),
      Complaint.countDocuments({
        departmentId: new Types.ObjectId(id),
        status: ComplaintStatus.RESOLVED,
      }),
      Complaint.countDocuments({
        departmentId: new Types.ObjectId(id),
        urgency: { $in: ['high', 'critical'] },
        status: { $ne: ComplaintStatus.RESOLVED },
      }),
    ]);

    return {
      ...dept,
      metrics: {
        openTickets,
        resolvedTickets,
        highUrgencyTickets,
      },
    };
  }

  async updateDepartment(id: string, updateData: Partial<CreateDepartmentDto> & { isActive?: boolean }) {
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const dept = await Department.findByIdAndUpdate(
      id,
      {
        ...updateData,
        headOfDepartment: updateData.headOfDepartment
          ? new Types.ObjectId(updateData.headOfDepartment)
          : undefined,
      },
      { new: true }
    ).populate('headOfDepartment', 'name email');

    if (!dept) {
      throw new Error('Department not found.');
    }

    return dept;
  }
}

export const departmentService = new DepartmentService();
