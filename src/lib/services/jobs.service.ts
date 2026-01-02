/**
 * Jobs Service
 * Clean Architecture - Service Layer
 * 
 * Handles all job-related business logic
 */

import { apiService } from '../api';
import { sanitizeObject } from '../sanitize';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  employerId: string;
  employerName: string;
  region: string;
  createdAt: string;
  category?: string;
  workType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experience?: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  salary: string;
  region: string;
  category?: string;
  workType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experience?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string;
}

export interface JobsResponse {
  success: boolean;
  data?: Job[];
  error?: string;
}

export interface SingleJobResponse {
  success: boolean;
  data?: Job;
  error?: string;
}

export class JobsService {
  /**
   * Get all jobs with optional filters
   * @param filters - Optional filters (region, category, etc.)
   */
  async getJobs(filters?: {
    region?: string;
    category?: string;
    search?: string;
  }): Promise<JobsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.region) queryParams.append('region', filters.region);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.search) queryParams.append('search', filters.search);

      const query = queryParams.toString();
      const endpoint = query ? `/jobs?${query}` : '/jobs';

      const response = await apiService.request(endpoint, {
        method: 'GET',
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to fetch jobs',
        };
      }

      return {
        success: true,
        data: response.data?.jobs || [],
      };
    } catch (error) {
      console.error('Get jobs error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get single job by ID
   * @param jobId - Job ID
   */
  async getJobById(jobId: string): Promise<SingleJobResponse> {
    try {
      const response = await apiService.request(`/jobs/${jobId}`, {
        method: 'GET',
      });

      if (!response.success || !response.data?.job) {
        return {
          success: false,
          error: response.error || 'Job not found',
        };
      }

      return {
        success: true,
        data: response.data.job,
      };
    } catch (error) {
      console.error('Get job error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create new job (employer only)
   * @param jobData - Job data
   */
  async createJob(jobData: CreateJobRequest): Promise<SingleJobResponse> {
    try {
      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.location) {
        return {
          success: false,
          error: 'Barcha majburiy maydonlarni to\'ldiring',
        };
      }

      // Sanitize input
      const sanitized = sanitizeObject(jobData);

      const response = await apiService.request('/jobs', {
        method: 'POST',
        body: JSON.stringify(sanitized),
      });

      if (!response.success || !response.data?.job) {
        return {
          success: false,
          error: response.error || 'Failed to create job',
        };
      }

      return {
        success: true,
        data: response.data.job,
      };
    } catch (error) {
      console.error('Create job error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update existing job (employer only)
   * @param jobData - Updated job data with ID
   */
  async updateJob(jobData: UpdateJobRequest): Promise<SingleJobResponse> {
    try {
      if (!jobData.id) {
        return {
          success: false,
          error: 'Job ID required',
        };
      }

      const { id, ...updates } = jobData;
      const sanitized = sanitizeObject(updates);

      const response = await apiService.request(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sanitized),
      });

      if (!response.success || !response.data?.job) {
        return {
          success: false,
          error: response.error || 'Failed to update job',
        };
      }

      return {
        success: true,
        data: response.data.job,
      };
    } catch (error) {
      console.error('Update job error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete job (employer only)
   * @param jobId - Job ID to delete
   */
  async deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiService.request(`/jobs/${jobId}`, {
        method: 'DELETE',
      });

      return {
        success: response.success,
        error: response.error,
      };
    } catch (error) {
      console.error('Delete job error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get employer's posted jobs
   */
  async getMyJobs(): Promise<JobsResponse> {
    try {
      const response = await apiService.request('/jobs/my-jobs', {
        method: 'GET',
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to fetch your jobs',
        };
      }

      return {
        success: true,
        data: response.data?.jobs || [],
      };
    } catch (error) {
      console.error('Get my jobs error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Apply to a job (worker only)
   * @param jobId - Job ID to apply to
   * @param coverLetter - Optional cover letter
   */
  async applyToJob(
    jobId: string,
    coverLetter?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const sanitized = sanitizeObject({ coverLetter });

      const response = await apiService.request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify(sanitized),
      });

      return {
        success: response.success,
        error: response.error,
      };
    } catch (error) {
      console.error('Apply to job error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const jobsService = new JobsService();
