import AcademicPeriods from '../types/academicPeriods';

class AcademicPeriodsService {
  constructor() {
    this.apiUrl = 'http://localhost:8080/api/academic-periods'; // Adjust to your backend URL
  }

  async getAll() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Error fetching academic periods: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item) => new AcademicPeriods(item));
    } catch (error) {
      console.error('Error in AcademicPeriodsService.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching academic period by ID: ${response.status}`);
      }
      const data = await response.json();
      return new AcademicPeriods(data);
    } catch (error) {
      console.error('Error in AcademicPeriodsService.getById:', error);
      throw error;
    }
  }

  async getByInstitutionId(institutionId) {
    try {
      const response = await fetch(`${this.apiUrl}/institution/${institutionId}`);
      if (!response.ok) {
        throw new Error(`Error fetching academic periods by institution ID: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item) => new AcademicPeriods(item));
    } catch (error) {
      console.error('Error in AcademicPeriodsService.getByInstitutionId:', error);
      throw error;
    }
  }

  async create(academicPeriod) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(academicPeriod),
      });
      if (!response.ok) {
        throw new Error(`Error creating academic period: ${response.status}`);
      }
      const data = await response.json();
      return new AcademicPeriods(data);
    } catch (error) {
      console.error('Error in AcademicPeriodsService.create:', error);
      throw error;
    }
  }

  async update(id, academicPeriod) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(academicPeriod),
      });
      if (!response.ok) {
        throw new Error(`Error updating academic period: ${response.status}`);
      }
      const data = await response.json();
      return new AcademicPeriods(data);
    } catch (error) {
      console.error('Error in AcademicPeriodsService.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting academic period: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in AcademicPeriodsService.delete:', error);
      throw error;
    }
  }
}

export default new AcademicPeriodsService();