import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EnrollmentList from './components/enrollments/EnrollmentList';
import AddEnrollment from './components/enrollments/AddEnrollment';
import EditEnrollment from './components/enrollments/EditEnrollment';
import Auth from './pages/auth/auth';
import Admin from './pages/admin/admin';
import Principal from './pages/principal/principal';
import Teacher from './pages/teacher/teacher';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/enrollments" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/teacher" element={<Teacher />} />
        
        {/* Rutas de matrículas */}
        <Route path="/enrollments" element={<EnrollmentList />} />
        <Route path="/enrollments/add" element={<AddEnrollment />} />
        <Route path="/enrollments/edit/:id" element={<EditEnrollment />} />
        
        {/* Ruta de respaldo para URLs no encontradas */}
        <Route path="*" element={<Navigate to="/enrollments" replace />} />
      </Routes>
    </Router>
  );
}

export default App;