import TeacherCoursesClassroom from '../types/teacherCoursesClassroom';

class TeacherCoursesClassroomService {
  constructor() {
    this.apiUrl = 'http://localhost:8080/api/teacher-courses-classroom'; // Adjust to your backend URL
  }

  async getAll() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Error fetching teacher courses classroom: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item) => new TeacherCoursesClassroom(item));
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching teacher courses classroom by ID: ${response.status}`);
      }
      const data = await response.json();
      return new TeacherCoursesClassroom(data);
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.getById:', error);
      throw error;
    }
  }

  async getByTeacherId(teacherId) {
    try {
      const response = await fetch(`${this.apiUrl}/teacher/${teacherId}`);
      if (!response.ok) {
        throw new Error(`Error fetching teacher courses classroom by teacher ID: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item) => new TeacherCoursesClassroom(item));
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.getByTeacherId:', error);
      throw error;
    }
  }

  async create(teacherCoursesClassroom) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherCoursesClassroom),
      });
      if (!response.ok) {
        throw new Error(`Error creating teacher courses classroom: ${response.status}`);
      }
      const data = await response.json();
      return new TeacherCoursesClassroom(data);
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.create:', error);
      throw error;
    }
  }

  async update(id, teacherCoursesClassroom) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherCoursesClassroom),
      });
      if (!response.ok) {
        throw new Error(`Error updating teacher courses classroom: ${response.status}`);
      }
      const data = await response.json();
      return new TeacherCoursesClassroom(data);
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error deleting teacher courses classroom: ${response.status}`);
      }
    } catch (error) {
      console.error('Error in TeacherCoursesClassroomService.delete:', error);
      throw error;
    }
  }
}

export default new TeacherCoursesClassroomService();