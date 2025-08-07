import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// TODO: Import service to fetch teacher details

const TeacherProfileView = ({ onClose }) => {
  const { id } = useParams();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement actual data fetching for a single teacher
    console.log('Fetching teacher with ID:', id);

    // Simulate fetching data
    const fetchTeacher = async () => {
        try {
             setLoading(true);
             // Replace with actual API call
             const dummyTeacherData = { 
                id: id, 
                firstName: 'Profesor', 
                lastName: `Apellido ${id}`,
                email: `profesor${id}@example.com`,
                phone: '987654321',
                userName: `profesor${id}`,
                documentType: 'DNI',
                documentNumber: `12345678${id}`,
                role: 'PROFESOR',
                status: 'ACTIVE',
                institutionId: '1',
                permissions: ['read', 'write']
             };
             // Simulate delay
             await new Promise(resolve => setTimeout(resolve, 500)); 
             setTeacher(dummyTeacherData);
             setError(null);
        } catch (err) {
            console.error('Error fetching teacher details:', err);
            setError('Error al cargar los detalles del profesor.');
            alert('Error al cargar los detalles del profesor.');
        } finally {
            setLoading(false);
        }
    };

    if (id) {
      fetchTeacher();
    } else {
      setTeacher(null);
      setLoading(false);
      setError('No se proporcionó un ID de profesor.');
    }

  }, [id]);

   if (loading) {
        return <div>Cargando detalles del profesor...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                 {onClose && <button className="btn btn-primary mt-3" onClick={onClose}>Cerrar</button>}
            </div>
        );
    }

    if (!teacher) {
        return (
             <div>
                <p>No se encontraron detalles del profesor.</p>
                {onClose && <button className="btn btn-primary mt-3" onClick={onClose}>Cerrar</button>}
            </div>
        );
    }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Detalles del Profesor: {teacher.firstName} {teacher.lastName}</h3>
      </div>
      <div className="card-body">
         <div className="row">
            <div className="col-md-6 mb-3">
                <strong className="d-block">Nombre:</strong> {teacher.firstName}
            </div>
            <div className="col-md-6 mb-3">
                <strong className="d-block">Apellido:</strong> {teacher.lastName}
            </div>
            <div className="col-md-6 mb-3">
                <strong className="d-block">Email:</strong> {teacher.email}
            </div>
             <div className="col-md-6 mb-3">
                <strong className="d-block">Teléfono:</strong> {teacher.phone}
            </div>
            <div className="col-md-6 mb-3">
                <strong className="d-block">Usuario:</strong> {teacher.userName}
            </div>
            <div className="col-md-6 mb-3">
                 <strong className="d-block">Tipo de Documento:</strong> {teacher.documentType}
            </div>
            <div className="col-md-6 mb-3">
                 <strong className="d-block">Número de Documento:</strong> {teacher.documentNumber}
            </div>
             <div className="col-md-6 mb-3">
                 <strong className="d-block">Rol:</strong> {teacher.role}
            </div>
            <div className="col-md-6 mb-3">
                 <strong className="d-block">Estado:</strong> {teacher.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
            </div>
             <div className="col-md-6 mb-3">
                <strong className="d-block">ID Institución:</strong> {teacher.institutionId}
            </div>
             <div className="col-md-12 mb-3">
                <strong className="d-block">Permisos:</strong> {teacher.permissions ? teacher.permissions.join(', ') : 'No tiene permisos asignados'}
            </div>
        </div>
        <div className="m-t-20 text-center">
             {onClose && <button type="button" className="btn btn-primary" onClick={onClose}>Cerrar</button>}
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileView;