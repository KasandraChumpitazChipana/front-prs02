class TeacherCoursesClassroom {
    constructor(data = {}) {
      this.id = data.id || null;
      this.teacherId = data.teacherId || null;
      this.coursesId = data.coursesId || null;
      this.classroomId = data.classroomId || null;
      this.status = data.status || 'A';
    }
  }
  
  export default TeacherCoursesClassroom;