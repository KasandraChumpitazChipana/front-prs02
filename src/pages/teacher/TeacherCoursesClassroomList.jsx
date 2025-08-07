import React, { useState, useEffect } from 'react';
import TeacherCoursesClassroomService from '../../services/teacherCoursesClassroom.service';

const TeacherCoursesClassroomList = ({ teacherId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = teacherId
          ? await TeacherCoursesClassroomService.getByTeacherId(teacherId)
          : await TeacherCoursesClassroomService.getAll();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [teacherId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Teacher Courses Classroom Assignments</h2>
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.id}>
            Teacher ID: {assignment.teacherId}, Course ID: {assignment.coursesId}, Classroom ID:{' '}
            {assignment.classroomId} - Status: {assignment.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherCoursesClassroomList;