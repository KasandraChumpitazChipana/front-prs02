/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from "../Header";
import Sidebar from "../Sidebar";
import { DatePicker, Space } from "antd";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Select from "react-select";
import { Link } from 'react-router-dom';
import { TimePicker } from 'antd';

// Importar servicios y tipos
import { userDocumentService } from '../../services/userDocumentService';
import { CreateDocumentRequest, UpdateDocumentRequest, DocumentStatus } from '../../types/UserDocument';

const AddAppoinments = () => {
  const { id } = useParams(); // Para detectar si estamos editando
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  const [isClicked, setIsClicked] = useState(false);
  const [value, setValue] = useState(null);
  const [value2, setValue2] = useState(null);
  const [endTime, setEndTime] = useState();
  const [selectedOption, setSelectedOption] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Estados para manejo de la API
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  
  // Estructura de datos para gestión de archivos
  const [fileData, setFileData] = useState({
    id: null,
    userId: '',
    fileName: '',
    fileType: '',
    fileUrl: '',
    uploadedAt: null,
    uploadedBy: 'usuario_actual', // En una app real vendría del contexto de auth
    description: '',
    status: DocumentStatus.ACTIVE
  });

  // Tipos de archivo soportados
  const supportedFileTypes = [
    { value: 'PDF', label: 'Documento PDF' },
    { value: 'XLS', label: 'Hoja de Cálculo Excel' },
    { value: 'XLSX', label: 'Hoja de Cálculo Excel (Nuevo)' },
    { value: 'PPT', label: 'Presentación PowerPoint' },
    { value: 'PPTX', label: 'Presentación PowerPoint (Nuevo)' },
    { value: 'DOC', label: 'Documento Word' },
    { value: 'DOCX', label: 'Documento Word (Nuevo)' },
    { value: 'IMAGE', label: 'Archivo de Imagen' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const [doctor, setDoctor] = useState([
    { value: 2, label: "Dr. Bernardo James" },
    { value: 3, label: "Dr. Andrea Lalema" },
    { value: 4, label: "Dr. William Stephin" },
  ]);

  // Efecto para cargar documento si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadDocumentForEdit(id);
    }
  }, [isEditing, id]);

  // Efecto para cargar documentos existentes cuando cambia el userId
  useEffect(() => {
    if (fileData.userId && !isEditing) {
      loadUserDocuments(fileData.userId);
    }
  }, [fileData.userId, isEditing]);

  // Cargar documento para edición
  const loadDocumentForEdit = async (documentId) => {
    try {
      setIsLoadingDocument(true);
      const response = await userDocumentService.getDocumentById(documentId);
      
      if (response.success && response.data) {
        const doc = response.data;
        setFileData({
          id: doc.id,
          userId: doc.userId || '',
          fileName: doc.fileName || '',
          fileType: doc.fileType || '',
          fileUrl: doc.fileUrl || '',
          uploadedAt: doc.uploadedAt,
          uploadedBy: doc.uploadedBy || 'usuario_actual',
          description: doc.description || '',
          status: doc.status || DocumentStatus.ACTIVE
        });

        // Si hay una URL del archivo, establecer como preview
        if (doc.fileUrl) {
          setPreviewUrl(doc.fileUrl);
        }

        // Cargar documentos del usuario si tenemos el userId
        if (doc.userId) {
          loadUserDocuments(doc.userId);
        }

        showMessage(`Cargando documento: ${doc.fileName}`, 'info');
      } else {
        showMessage('Error al cargar el documento para edición', 'error');
        navigate('/appoinmentlist');
      }
    } catch (error) {
      console.error('Error loading document for edit:', error);
      showMessage('Error al cargar el documento', 'error');
      navigate('/appoinmentlist');
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Función para mostrar mensajes
  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType('');
    }, 5000);
  };

  // Cargar documentos del usuario
  const loadUserDocuments = async (userId) => {
    try {
      setIsLoading(true);
      const response = await userDocumentService.getDocumentsByUserId(userId);
      
      if (response.success) {
        // Filtrar el documento actual si estamos editando
        let docs = response.data || [];
        if (isEditing && id) {
          docs = docs.filter(doc => doc.id !== parseInt(id));
        }
        setExistingDocuments(docs);
      } else {
        console.warn('Error loading user documents:', response.error);
        setExistingDocuments([]);
      }
    } catch (error) {
      console.error('Error loading user documents:', error);
      setExistingDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (date, dateString) => {
    setIsClicked(true);
  };

  const onChange1 = (time) => {
    setValue(time);
  };

  const onChange2 = (time) => {
    setValue2(time);
  };

  const loadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showMessage('El archivo es demasiado grande. Tamaño máximo: 10MB', 'error');
        return;
      }

      // Obtener extensión del archivo para determinar el tipo
      const fileExtension = file.name.split('.').pop().toUpperCase();
      
      // Crear URL del archivo para vista previa
      const fileUrl = URL.createObjectURL(file);
      
      // Guardar referencia al archivo seleccionado
      setSelectedFile(file);
      
      // Actualizar datos del archivo
      setFileData(prevData => ({
        ...prevData,
        fileName: file.name,
        fileType: fileExtension,
        fileUrl: fileUrl,
        uploadedAt: isEditing ? prevData.uploadedAt : new Date().toISOString(),
        description: prevData.description || `Archivo subido: ${file.name}`
      }));
      
      setPreviewUrl(fileUrl);
      
      console.log('Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: fileExtension
      });
    }
  };

  const handleFileTypeChange = (selectedFileType) => {
    setFileData(prevData => ({
      ...prevData,
      fileType: selectedFileType.value
    }));
  };

  const handleDescriptionChange = (event) => {
    setFileData(prevData => ({
      ...prevData,
      description: event.target.value
    }));
  };

  const handleUserIdChange = (event) => {
    setFileData(prevData => ({
      ...prevData,
      userId: event.target.value
    }));
  };

  // Función para simular subida de archivo (en una app real sería a un servicio de almacenamiento)
  const uploadFileToStorage = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular URL del archivo subido
        const mockUrl = `https://storage.example.com/documents/${Date.now()}-${file.name}`;
        resolve(mockUrl);
      }, 1000);
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!fileData.userId) {
      showMessage('El ID de usuario es requerido', 'error');
      return;
    }

    if (!isEditing && !selectedFile) {
      showMessage('Debe seleccionar un archivo', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      if (isEditing) {
        showMessage('Actualizando documento...', 'info');
        await handleUpdateDocument();
      } else {
        showMessage('Subiendo documento...', 'info');
        await handleCreateDocument();
      }

    } catch (error) {
      showMessage(`Error inesperado: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo documento
  const handleCreateDocument = async () => {
    // 1. Subir archivo al almacenamiento (simulado)
    const uploadedFileUrl = await uploadFileToStorage(selectedFile);

    // 2. Crear request para la API
    const createRequest = new CreateDocumentRequest({
      userId: fileData.userId,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileUrl: uploadedFileUrl,
      uploadedBy: fileData.uploadedBy,
      description: fileData.description
    });

    // 3. Enviar a la API
    const response = await userDocumentService.createDocument(createRequest);

    if (response.success) {
      showMessage('Documento guardado exitosamente', 'success');
      
      // Redirigir al listado con mensaje de éxito
      setTimeout(() => {
        navigate('/appoinmentlist', {
          state: {
            message: 'Documento creado exitosamente',
            messageType: 'success'
          }
        });
      }, 1500);
    } else {
      showMessage(`Error al guardar: ${response.error}`, 'error');
    }
  };

  // Actualizar documento existente
  const handleUpdateDocument = async () => {
    let uploadedFileUrl = fileData.fileUrl; // Mantener URL existente por defecto

    // Si se seleccionó un nuevo archivo, subirlo
    if (selectedFile) {
      uploadedFileUrl = await uploadFileToStorage(selectedFile);
    }

    // Crear request de actualización
    const updateRequest = new UpdateDocumentRequest({
      userId: fileData.userId,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileUrl: uploadedFileUrl,
      uploadedBy: fileData.uploadedBy,
      description: fileData.description
    });

    const response = await userDocumentService.updateDocument(id, updateRequest);

    if (response.success) {
      showMessage('Documento actualizado exitosamente', 'success');
      
      // Redirigir al listado con mensaje de éxito
      setTimeout(() => {
        navigate('/appoinmentlist', {
          state: {
            message: 'Documento actualizado exitosamente',
            messageType: 'success'
          }
        });
      }, 1500);
    } else {
      showMessage(`Error al actualizar: ${response.error}`, 'error');
    }
  };

  // Función para cambiar estado de un documento
  const handleToggleDocumentStatus = async (documentId, currentStatus) => {
    try {
      setIsLoading(true);
      
      let response;
      if (currentStatus === DocumentStatus.ACTIVE) {
        response = await userDocumentService.deactivateDocument(documentId);
        showMessage('Desactivando documento...', 'info');
      } else {
        response = await userDocumentService.activateDocument(documentId);
        showMessage('Activando documento...', 'info');
      }

      if (response.success) {
        const action = currentStatus === DocumentStatus.ACTIVE ? 'desactivado' : 'activado';
        showMessage(`Documento ${action} exitosamente`, 'success');
        
        if (fileData.userId) {
          await loadUserDocuments(fileData.userId);
        }
      } else {
        showMessage(`Error: ${response.error}`, 'error');
      }

    } catch (error) {
      showMessage(`Error inesperado: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar documento permanentemente
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('¿Está seguro de eliminar este documento permanentemente?')) {
      return;
    }

    try {
      setIsLoading(true);
      showMessage('Eliminando documento...', 'info');

      const response = await userDocumentService.deleteDocument(documentId);

      if (response.success) {
        showMessage('Documento eliminado exitosamente', 'success');
        
        if (fileData.userId) {
          await loadUserDocuments(fileData.userId);
        }
      } else {
        showMessage(`Error al eliminar: ${response.error}`, 'error');
      }

    } catch (error) {
      showMessage(`Error inesperado: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    if (isEditing) {
      // Si estamos editando, volver al listado
      navigate('/appoinmentlist');
    } else {
      // Si estamos creando, limpiar el formulario
      setFileData({
        id: null,
        userId: fileData.userId, // Mantener el userId
        fileName: '',
        fileType: '',
        fileUrl: '',
        uploadedAt: null,
        uploadedBy: 'usuario_actual',
        description: '',
        status: DocumentStatus.ACTIVE
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Limpiar input de archivo
      const fileInput = document.getElementById('file');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const openPreview = () => {
    if (previewUrl) {
      setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const renderFilePreview = () => {
    if (!previewUrl || !fileData.fileName) return null;

    const fileExtension = fileData.fileType.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'image'].includes(fileExtension);
    const isPDF = fileExtension === 'pdf';

    return (
      <div className="col-12 mt-3">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Vista Previa del Archivo</h6>
            <div>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-primary me-2"
                onClick={openPreview}
              >
                <FeatherIcon icon="maximize-2" size={14} className="me-1" />
                Ampliar
              </button>
              <a 
                href={previewUrl} 
                download={fileData.fileName}
                className="btn btn-sm btn-success"
              >
                <FeatherIcon icon="download" size={14} className="me-1" />
                Descargar
              </a>
            </div>
          </div>
          <div className="card-body">
            {isImage ? (
              <div className="text-center">
                <img 
                  src={previewUrl} 
                  alt={fileData.fileName}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ) : isPDF ? (
              <div>
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="400px"
                  style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
                  title={fileData.fileName}
                />
              </div>
            ) : (
              <div className="text-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <FeatherIcon icon="file" size={48} className="text-muted mb-3" />
                <h6>{fileData.fileName}</h6>
                <p className="text-muted mb-0">
                  Tipo de archivo: {fileData.fileType} 
                  <br />
                  Vista previa no disponible para este tipo de archivo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar documentos existentes del usuario
  const renderExistingDocuments = () => {
    if (!fileData.userId || existingDocuments.length === 0) return null;

    return (
      <div className="col-12 mt-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <FeatherIcon icon="folder" size={16} className="me-2" />
              Otros Documentos del Usuario ({existingDocuments.length})
            </h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Archivo</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {existingDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FeatherIcon icon="file" size={16} className="me-2 text-muted" />
                          <div>
                            <div className="font-weight-semibold">{doc.fileName}</div>
                            {doc.description && (
                              <small className="text-muted">{doc.description}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">{doc.fileType}</span>
                      </td>
                      <td>
                        <small>{new Date(doc.uploadedAt).toLocaleDateString('es-ES')}</small>
                      </td>
                      <td>
                        <span className={`badge ${doc.status === DocumentStatus.ACTIVE ? 'bg-success' : 'bg-secondary'}`}>
                          {doc.status === DocumentStatus.ACTIVE ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn btn-outline-${doc.status === DocumentStatus.ACTIVE ? 'warning' : 'success'}`}
                            onClick={() => handleToggleDocumentStatus(doc.id, doc.status)}
                            disabled={isLoading}
                            title={doc.status === DocumentStatus.ACTIVE ? 'Desactivar' : 'Activar'}
                          >
                            <FeatherIcon 
                              icon={doc.status === DocumentStatus.ACTIVE ? 'pause' : 'play'} 
                              size={12} 
                            />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteDocument(doc.id)}
                            disabled={isLoading}
                            title="Eliminar permanentemente"
                          >
                            <FeatherIcon icon="trash-2" size={12} />
                          </button>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary"
                              title="Ver archivo"
                            >
                              <FeatherIcon icon="external-link" size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar mensaje de estado
  const renderMessage = () => {
    if (!message) return null;

    const alertClass = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    }[messageType] || 'alert-info';

    const icon = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    }[messageType] || 'info';

    return (
      <div className={`alert ${alertClass} alert-dismissible fade show`} role="alert">
        <FeatherIcon icon={icon} size={16} className="me-2" />
        {message}
        <button
          type="button"
          className="btn-close"
          onClick={() => setMessage(null)}
        ></button>
      </div>
    );
  };

  // Mostrar spinner mientras carga el documento para edición
  if (isEditing && isLoadingDocument) {
    return (
      <div>
        <Header />
        <Sidebar id="menu-item4" id1="menu-items4" activeClassName="add-appoinment" />
        <div className="page-wrapper">
          <div className="content">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <FeatherIcon icon="loader" size={48} className="text-primary rotating mb-3" />
                <h4>Cargando documento...</h4>
                <p className="text-muted">Por favor espere mientras cargamos la información del documento.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Sidebar
        id="menu-item4"
        id1="menu-items4"
        activeClassName="add-appoinment"
      />
      <>
        <div className="page-wrapper">
          <div className="content">
            {/* Encabezado de Página */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                     <Link to="/appoinmentlist">Documentos</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">
                      {isEditing ? 'Editar Documento' : 'Agregar Documento'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Encabezado de Página */}

            {/* Mensaje de estado */}
            {renderMessage()}

            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        
                        {/* Sección de Gestión de Archivos */}
                        <div className="col-12">
                          <div className="form-heading">
                            <h4>
                              {isEditing ? (
                                <>
                                  <FeatherIcon icon="edit-2" size={20} className="me-2" />
                                  Editar Documento
                                </>
                              ) : (
                                <>
                                  <FeatherIcon icon="plus" size={20} className="me-2" />
                                  Nuevo Documento
                                </>
                              )}
                            </h4>
                            {isEditing && (
                              <p className="text-muted">
                                Editando documento ID: {id} | {fileData.fileName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>ID de Usuario <span className="login-danger">*</span></label>
                            <input 
                              className="form-control" 
                              type="text" 
                              value={fileData.userId}
                              onChange={handleUserIdChange}
                              placeholder="Ingrese ID del usuario"
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>Tipo de Archivo</label>
                            <Select
                              value={supportedFileTypes.find(option => option.value === fileData.fileType)}
                              onChange={handleFileTypeChange}
                              options={supportedFileTypes}
                              placeholder="Seleccionar tipo de archivo..."
                              isDisabled={isLoading}
                              menuPortalTarget={document.body}
                              components={{
                                IndicatorSeparator: () => null
                              }}
                              styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ?'none' : '2px solid rgba(46, 55, 164, 0.1);',
                                   boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                                  '&:hover': {
                                    borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                                  },
                                  borderRadius: '10px',
                                  fontSize: "14px",
                                    minHeight: "45px",
                                }),
                                dropdownIndicator: (base, state) => ({
                                  ...base,
                                  transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                  transition: '250ms',
                                  width: '35px',
                                  height: '35px',
                                }),
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>Nombre del Archivo</label>
                            <input 
                              className="form-control" 
                              type="text" 
                              value={fileData.fileName}
                              readOnly
                              placeholder={isEditing ? "Nombre del archivo actual" : "El archivo se nombrará automáticamente"}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>Estado</label>
                            <input 
                              className="form-control" 
                              type="text" 
                              value={fileData.status}
                              readOnly
                              style={{ backgroundColor: '#f8f9fa' }}
                            />
                          </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-top-form">
                            <label className="local-top">
                              {isEditing ? 'Cambiar Archivo (Opcional)' : 'Subir Archivo'} 
                              {!isEditing && <span className="login-danger">*</span>}
                            </label>
                            <div className="settings-btn upload-files-avator">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                                name="file"
                                id="file"
                                onChange={loadFile}
                                className="hide-input"
                                disabled={isLoading}
                              />
                              <label htmlFor="file" className={`upload ${isLoading ? 'disabled' : ''}`}>
                                {isLoading ? (
                                  <>
                                    <FeatherIcon icon="loader" size={16} className="me-2 rotating" />
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <FeatherIcon icon="upload" size={16} className="me-2" />
                                    {isEditing ? 'Cambiar Archivo' : 'Elegir Archivo'}
                                  </>
                                )}
                              </label>
                            </div>
                            {fileData.fileName && (
                              <div className="mt-2">
                                <small className="text-success d-block">
                                  <FeatherIcon icon="check-circle" size={14} className="me-1" />
                                  {isEditing && !selectedFile ? 'Archivo actual: ' : 'Seleccionado: '}{fileData.fileName}
                                </small>
                                <small className="text-info">
                                  Tipo: {fileData.fileType} | Estado: {fileData.fileUrl ? (isEditing ? 'Listo para actualizar' : 'Listo para guardar') : 'Procesando...'}
                                </small>
                              </div>
                            )}
                            {isEditing && !selectedFile && (
                              <div className="mt-2">
                                <small className="text-info">
                                  Si no selecciona un nuevo archivo, se mantendrá el archivo actual
                                </small>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="form-group local-forms">
                            <label>Descripción del Archivo</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              value={fileData.description}
                              onChange={handleDescriptionChange}
                              placeholder="Ingrese descripción del archivo..."
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* Vista previa del archivo */}
                        {renderFilePreview()}

                        {/* Documentos existentes - Solo mostrar en modo creación */}
                        {!isEditing && renderExistingDocuments()}

                        <div className="col-12 mt-4">
                          <div className="doctor-submit text-end">
                            <button
                              type="submit"
                              className="btn btn-primary submit-form me-2"
                              disabled={isLoading || (!isEditing && !selectedFile) || !fileData.userId}
                            >
                              {isLoading ? (
                                <>
                                  <FeatherIcon icon="loader" size={16} className="me-1 rotating" />
                                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                                </>
                              ) : (
                                <>
                                  <FeatherIcon icon={isEditing ? "save" : "save"} size={16} className="me-1" />
                                  {isEditing ? 'Actualizar' : 'Guardar'}
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary cancel-form"
                              onClick={resetForm}
                              disabled={isLoading}
                            >
                              <FeatherIcon icon="x" size={16} className="me-1" />
                              {isEditing ? 'Volver al Listado' : 'Cancelar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal para vista previa ampliada */}
          {isPreviewOpen && (
            <div 
              className="modal fade show d-block" 
              style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
              onClick={closePreview}
            >
              <div 
                className="modal-dialog modal-xl modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{fileData.fileName}</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={closePreview}
                    ></button>
                  </div>
                  <div className="modal-body p-0">
                    {fileData.fileType.toLowerCase().includes('image') || fileData.fileType === 'IMAGE' ? (
                      <img 
                        src={previewUrl} 
                        alt={fileData.fileName}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    ) : fileData.fileType === 'PDF' ? (
                      <iframe
                        src={previewUrl}
                        width="100%"
                        height="600px"
                        style={{ border: 'none' }}
                        title={fileData.fileName}
                      />
                    ) : (
                      <div className="text-center p-5">
                        <FeatherIcon icon="file" size={64} className="text-muted mb-3" />
                        <h4>{fileData.fileName}</h4>
                        <p className="text-muted">Vista previa no disponible para este tipo de archivo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="notification-box">
            <div className="msg-sidebar notifications msg-noti">
              <div className="topnav-dropdown-header">
                <span>Mensajes</span>
              </div>
              <div className="drop-scroll msg-list-scroll" id="msg_list">
                <ul className="list-box">
                  <li>
                   <Link to="#">
                      <div className="list-item">
                        <div className="list-left">
                          <span className="avatar">R</span>
                        </div>
                        <div className="list-body">
                          <span className="message-author">Richard Miles </span>
                          <span className="message-time">12:28 AM</span>
                          <div className="clearfix" />
                          <span className="message-content">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                   <Link to="#">
                      <div className="list-item new-message">
                        <div className="list-left">
                          <span className="avatar">J</span>
                        </div>
                        <div className="list-body">
                          <span className="message-author">John Doe</span>
                          <span className="message-time">1 Aug</span>
                          <div className="clearfix" />
                          <span className="message-content">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="topnav-dropdown-footer">
               <Link to="#">Ver todos los mensajes</Link>
              </div>
            </div>
          </div>
        </div>
      </>
      
      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .rotating {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .upload.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .card {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid rgba(0, 0, 0, 0.125);
        }
        
        .alert {
          border: none;
          border-radius: 8px;
        }
        
        .btn {
          border-radius: 8px;
          font-weight: 500;
        }
        
        .btn-primary {
          background-color: #2e37a4;
          border-color: #2e37a4;
        }
        
        .btn-primary:hover {
          background-color: #252d8a;
          border-color: #252d8a;
        }
        
        .form-control {
          border-radius: 8px;
          border: 2px solid rgba(46, 55, 164, 0.1);
        }
        
        .form-control:focus {
          border-color: #2e37a4;
          box-shadow: 0 0 0 0.2rem rgba(46, 55, 164, 0.25);
        }
        
        .table th {
          border-top: none;
          font-weight: 600;
          color: #495057;
          background-color: #f8f9fa;
        }
        
        .badge {
          font-size: 0.75em;
          font-weight: 500;
        }
        
        .breadcrumb {
          background-color: transparent;
          padding: 0;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content: none;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .form-heading h4 {
          color: #2e37a4;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .doctor-submit {
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default AddAppoinments;