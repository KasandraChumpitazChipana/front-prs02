"use client"

/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { Table, message, Modal, DatePicker, Spin } from "antd"
import Header from "../Header"
import Sidebar from "../Sidebar"
import { blogimg10, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal } from "../imagepath"
import { onShowSizeChange, itemRender } from "../Pagination"
import { Link } from "react-router-dom"
import FeatherIcon from "feather-icons-react/build/FeatherIcon"
import { userDocumentService } from "../../services/userDocumentService"

const { RangePicker } = DatePicker
const { confirm } = Modal

const UserDocumentList = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("ALL") // ALL, ACTIVE, INACTIVE
  const [searchText, setSearchText] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [previewModal, setPreviewModal] = useState({ visible: false, url: '', fileName: '' })

  // Definir estados locales para evitar problemas de importación
  const DocumentStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  }

  // Función para manejar la visualización/descarga de archivos
  const handleFileAction = async (record) => {
    const { fileUrl, fileName, fileType } = record
    
    if (!fileUrl) {
      message.error('No hay URL disponible para este archivo')
      return
    }

    try {
      // Verificar si es un PDF
      if (fileType && fileType.toLowerCase().includes('pdf')) {
        // Para PDFs, abrir en modal de vista previa
        setPreviewModal({
          visible: true,
          url: fileUrl,
          fileName: fileName || 'Documento PDF'
        })
      } else {
        // Para otros tipos de archivo, descargar directamente
        await downloadFile(fileUrl, fileName)
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      message.error('Error al procesar el archivo')
    }
  }

  // Función para descargar archivos
  const downloadFile = async (url, fileName) => {
    try {
      // Método alternativo más compatible: abrir en nueva ventana
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'archivo_descargado'
      link.target = '_blank' // Abrir en nueva ventana como respaldo
      
      // Intentar descarga directa
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      message.success(`Iniciando descarga: "${fileName}"`)
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      // Método de respaldo: abrir URL directamente
      try {
        window.open(url, '_blank')
        message.info('Archivo abierto en nueva ventana')
      } catch (fallbackError) {
        message.error('Error al acceder al archivo')
      }
    }
  }

  // Función para cerrar el modal de vista previa
  const handleClosePreview = () => {
    setPreviewModal({ visible: false, url: '', fileName: '' })
  }

  // Función para descargar desde el modal
  const handleDownloadFromModal = () => {
    downloadFile(previewModal.url, previewModal.fileName)
  }

  // Manejar mensajes de estado que vienen del componente de creación/edición
  useEffect(() => {
    if (location.state?.message) {
      const { message: msg, messageType } = location.state
      
      // Mostrar mensaje usando antd
      if (messageType === 'success') {
        message.success(msg)
      } else if (messageType === 'error') {
        message.error(msg)
      } else if (messageType === 'warning') {
        message.warning(msg)
      } else {
        message.info(msg)
      }
      
      // Limpiar el estado para evitar que se muestre de nuevo
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments()
  }, [])

  // Filtrar documentos cuando cambian los filtros o el estado seleccionado
  useEffect(() => {
    filterDocuments()
  }, [documents, filterStatus, searchText])

  /**
   * Cargar documentos según el filtro seleccionado
   */
  const loadDocuments = async () => {
    try {
      setLoading(true)
      let response

      // Cargar documentos según el filtro actual
      switch (filterStatus) {
        case "ACTIVE":
          response = await userDocumentService.getAllActiveDocuments()
          break
        case "INACTIVE":
          response = await userDocumentService.getInactiveDocuments()
          break
        case "ALL":
        default:
          response = await userDocumentService.getAllDocuments()
          break
      }

      if (response.success && response.data) {
        // Asegurar que todos los documentos tienen una estructura válida
        const validatedDocuments = response.data.map((doc) => ({
          ...doc,
          status: doc.status || DocumentStatus.ACTIVE, // Por defecto activo si no hay status
          fileName: doc.fileName || "Sin nombre",
          fileType: doc.fileType || "Desconocido",
          uploadedBy: doc.uploadedBy || "Desconocido",
          userId: doc.userId || "",
          description: doc.description || "",
          uploadedAt: doc.uploadedAt || null,
        }))
        setDocuments(validatedDocuments)
        console.log(`Cargados ${validatedDocuments.length} documentos con filtro: ${filterStatus}`)
      } else {
        message.error(response.error || "Error al cargar los documentos")
        setDocuments([])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      message.error("Error al cargar los documentos")
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filtrar documentos por texto de búsqueda y estado
   */
  const filterDocuments = () => {
    let filtered = [...documents]

    // Filtrar por estado si no es "ALL"
    if (filterStatus !== "ALL") {
      if (filterStatus === "ACTIVE") {
        filtered = filtered.filter(doc => isDocumentActive(doc))
      } else if (filterStatus === "INACTIVE") {
        filtered = filtered.filter(doc => !isDocumentActive(doc))
      }
    }

    // Aplicar filtro de texto de búsqueda si existe
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          (doc.fileName && doc.fileName.toLowerCase().includes(searchLower)) ||
          (doc.fileType && doc.fileType.toLowerCase().includes(searchLower)) ||
          (doc.uploadedBy && doc.uploadedBy.toLowerCase().includes(searchLower)) ||
          (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
          (doc.userId && doc.userId.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredDocuments(filtered)
  }

  /**
   * Manejar cambio de filtro de estado
   */
  const handleStatusFilterChange = (newStatus) => {
    setFilterStatus(newStatus)
    setSelectedRowKeys([]) // Limpiar selecciones
    // loadDocuments se ejecutará automáticamente por el useEffect
  }

  /**
   * Recargar documentos manualmente
   */
  const handleRefresh = () => {
    setSelectedRowKeys([])
    setSearchText("")
    loadDocuments()
    loadStats() // También recargar estadísticas
  }

  /**
   * Eliminado lógico - Desactivar documento (solo para activos)
   */
  const handleDeactivateDocument = async (documentId, fileName) => {
    confirm({
      title: "Eliminado Lógico - Desactivar Documento",
      icon: <FeatherIcon icon="archive" />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas desactivar el documento "{fileName}"?</p>
          <p className="text-warning">
            <strong>ℹ️ El documento será movido a inactivos pero no se eliminará permanentemente.</strong>
          </p>
        </div>
      ),
      okText: "Desactivar",
      okType: "warning",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true)
          const response = await userDocumentService.deactivateDocument(documentId)

          if (response.success) {
            message.success("Documento desactivado exitosamente")
            await loadDocuments()
            await loadStats()
          } else {
            message.error(response.error || "Error al desactivar el documento")
          }
        } catch (error) {
          console.error("Error deactivating document:", error)
          message.error("Error al desactivar el documento")
        } finally {
          setLoading(false)
        }
      },
    })
  }

  /**
   * Restaurar documento (solo para inactivos)
   */
  const handleActivateDocument = async (documentId, fileName) => {
    confirm({
      title: "Restaurar Documento",
      icon: <FeatherIcon icon="refresh-cw" />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas restaurar el documento "{fileName}"?</p>
          <p className="text-success">
            <strong>✅ El documento será reactivado y estará disponible nuevamente.</strong>
          </p>
        </div>
      ),
      okText: "Restaurar",
      okType: "primary",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true)
          const response = await userDocumentService.activateDocument(documentId)

          if (response.success) {
            message.success("Documento restaurado exitosamente")
            await loadDocuments()
            await loadStats()
          } else {
            message.error(response.error || "Error al restaurar el documento")
          }
        } catch (error) {
          console.error("Error activating document:", error)
          message.error("Error al restaurar el documento")
        } finally {
          setLoading(false)
        }
      },
    })
  }

  /**
   * Eliminar documento permanentemente (disponible para ambos estados)
   */
  const handleDeleteDocument = async (documentId, fileName) => {
    confirm({
      title: "Eliminar Documento Permanentemente",
      icon: <FeatherIcon icon="trash-2" />,
      content: (
        <div>
          <p>¿Estás seguro de que deseas eliminar permanentemente el documento "{fileName}"?</p>
          <p className="text-danger">
            <strong>⚠️ Esta acción eliminará el documento completamente y NO se puede deshacer.</strong>
          </p>
          <p className="text-muted">
            <small>El archivo será eliminado del sistema y no podrá ser recuperado.</small>
          </p>
        </div>
      ),
      okText: "Eliminar Permanentemente",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          setLoading(true)
          const response = await userDocumentService.deleteDocument(documentId)

          if (response.success) {
            message.success("Documento eliminado permanentemente")
            await loadDocuments()
            await loadStats()
          } else {
            message.error(response.error || "Error al eliminar el documento")
          }
        } catch (error) {
          console.error("Error deleting document:", error)
          message.error("Error al eliminar el documento")
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return pdficon4
    const type = fileType.toLowerCase()
    if (type.includes("pdf")) return pdficon
    if (type.includes("image") || type.includes("jpg") || type.includes("png") || type.includes("gif")) return blogimg10
    if (type.includes("doc") || type.includes("word")) return pdficon3
    return pdficon4
  }

  const formatDate = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatTime = (date) => {
    if (!date) return "-"
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isDocumentActive = (document) => {
    if (!document || !document.status) {
      return false
    }
    // Soportar tanto 'ACTIVE'/'INACTIVE' como 'A'/'I' para compatibilidad
    return document.status === DocumentStatus.ACTIVE || 
           document.status === "A" || 
           document.status === "ACTIVE"
  }

  const getStatusBadge = (document) => {
    if (isDocumentActive(document)) {
      return <span className="badge bg-success">Activo</span>
    }
    return <span className="badge bg-danger">Inactivo</span>
  }

  const columns = [
    {
      title: "Archivo",
      dataIndex: "fileName",
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <img
            src={getFileIcon(record.fileType) || "/placeholder.svg"}
            alt="File"
            className="me-2"
            style={{ width: "32px", height: "32px" }}
          />
          <div>
            {record.fileUrl ? (
              <button
                className="btn btn-link p-0 text-start"
                onClick={() => handleFileAction(record)}
                style={{ textDecoration: 'none', color: '#007bff' }}
                title={record.fileType?.toLowerCase().includes('pdf') ? 'Click para visualizar PDF' : 'Click para descargar archivo'}
              >
                {record.fileName || "Sin nombre"}
                {record.fileType?.toLowerCase().includes('pdf') && (
                  <i className="fas fa-eye ms-1" style={{ fontSize: '0.8em' }}></i>
                )}
                {!record.fileType?.toLowerCase().includes('pdf') && (
                  <i className="fas fa-download ms-1" style={{ fontSize: '0.8em' }}></i>
                )}
              </button>
            ) : (
              <span>{record.fileName || "Sin nombre"}</span>
            )}
            <small className="d-block text-muted">{record.fileType || "Tipo desconocido"}</small>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.fileName || "").localeCompare(b.fileName || ""),
    },
    {
      title: "Usuario ID",
      dataIndex: "userId",
      render: (text) => text || "-",
      sorter: (a, b) => (a.userId || "").localeCompare(b.userId || ""),
    },
    {
      title: "Subido por",
      dataIndex: "uploadedBy",
      render: (text) => text || "-",
      sorter: (a, b) => (a.uploadedBy || "").localeCompare(b.uploadedBy || ""),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      render: (text) => (
        <span title={text}>{text && text.length > 50 ? `${text.substring(0, 50)}...` : text || "-"}</span>
      ),
    },
    {
      title: "Fecha",
      dataIndex: "uploadedAt",
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        if (!a.uploadedAt && !b.uploadedAt) return 0
        if (!a.uploadedAt) return 1
        if (!b.uploadedAt) return -1
        return new Date(a.uploadedAt) - new Date(b.uploadedAt)
      },
    },
    {
      title: "Hora",
      dataIndex: "uploadedAt",
      render: (date) => formatTime(date),
    },
    // Columna de estado: Solo mostrar cuando filterStatus es "ALL"
    ...(filterStatus === "ALL" ? [{
      title: "Estado",
      dataIndex: "status",
      render: (status, record) => getStatusBadge(record),
      sorter: (a, b) => isDocumentActive(a) - isDocumentActive(b),
    }] : []),
    {
      title: "Acciones",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex gap-1 justify-content-end">
          {/* Botón Descargar directo - Siempre disponible */}
          {record.fileUrl && (
            <button 
              onClick={() => downloadFile(record.fileUrl, record.fileName)}
              className="btn btn-sm btn-outline-info"
              title="Descargar archivo"
            >
              <i className="fas fa-download" />
            </button>
          )}
          
          {/* Acciones para documentos ACTIVOS */}
          {isDocumentActive(record) && (
            <>
              {/* Botón Editar - Solo para activos */}
              <Link 
                to={`/editappoinments/${record.id}`}
                className="btn btn-sm btn-outline-primary"
                title="Editar documento"
              >
                <i className="fas fa-edit" />
              </Link>
              
              {/* Botón Eliminado Lógico (Desactivar) - Solo para activos */}
              <button 
                className="btn btn-sm btn-outline-warning"
                onClick={() => handleDeactivateDocument(record.id, record.fileName)}
                title="Desactivar documento (Eliminado lógico)"
              >
                <i className="fas fa-archive" />
              </button>
              
              {/* Botón Eliminar Permanentemente - Para activos */}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteDocument(record.id, record.fileName)}
                title="Eliminar permanentemente"
              >
                <i className="fas fa-trash" />
              </button>
            </>
          )}
          
          {/* Acciones para documentos INACTIVOS */}
          {!isDocumentActive(record) && (
            <>
              {/* Botón Restaurar - Solo para inactivos */}
              <button 
                className="btn btn-sm btn-outline-success"
                onClick={() => handleActivateDocument(record.id, record.fileName)}
                title="Restaurar documento"
              >
                <i className="fas fa-undo" />
              </button>
              
              {/* Botón Eliminar Permanentemente - Solo para inactivos */}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteDocument(record.id, record.fileName)}
                title="Eliminar permanentemente"
              >
                <i className="fas fa-trash" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  // Estadísticas de documentos - calculadas desde todos los documentos
  const [stats, setStats] = useState({ active: 0, inactive: 0, total: 0 })

  // Cargar estadísticas al cambiar el componente
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Intentar usar el endpoint de estadísticas del servicio
      const statsResponse = await userDocumentService.getDocumentStats()
      
      if (statsResponse.success && statsResponse.data) {
        setStats({
          active: statsResponse.data.active || 0,
          inactive: statsResponse.data.inactive || 0,
          total: statsResponse.data.total || 0
        })
      } else {
        // Si falla el endpoint de estadísticas, calcularlo manualmente
        const allDocsResponse = await userDocumentService.getAllDocuments()
        if (allDocsResponse.success && allDocsResponse.data) {
          const allDocs = allDocsResponse.data
          
          // Contar documentos activos e inactivos con diferentes formatos de estado
          const activeCount = allDocs.filter(doc => 
            doc.status === 'ACTIVE' || 
            doc.status === 'A' || 
            doc.status === DocumentStatus.ACTIVE
          ).length
          
          const inactiveCount = allDocs.filter(doc => 
            doc.status === 'INACTIVE' || 
            doc.status === 'I' || 
            doc.status === DocumentStatus.INACTIVE
          ).length
          
          setStats({
            active: activeCount,
            inactive: inactiveCount,
            total: allDocs.length
          })
          
          console.log('Estadísticas calculadas:', { activeCount, inactiveCount, total: allDocs.length })
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error)
      // Establecer valores por defecto en caso de error
      setStats({ active: 0, inactive: 0, total: 0 })
    }
  }

  // Recargar documentos cuando cambie el filtro
  useEffect(() => {
    loadDocuments()
  }, [filterStatus])

  return (
    <>
      <Header />
      <Sidebar id="menu-item4" id1="menu-items4" activeClassName="user-documents-list" />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="#">Documentos</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FeatherIcon icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Lista de Documentos</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}

          {/* Botones de Filtro con Estadísticas */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-center">
                    <div className="btn-group" role="group" aria-label="Document Status Filter">
                      <button
                        type="button"
                        className={`btn btn-outline-info ${filterStatus === 'ALL' ? 'active' : ''}`}
                        onClick={() => handleStatusFilterChange('ALL')}
                        disabled={loading}
                      >
                        <i className="fas fa-list me-2"></i>
                        Todos los Documentos
                        <span className="badge bg-info ms-2">{stats.total}</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-success ${filterStatus === 'ACTIVE' ? 'active' : ''}`}
                        onClick={() => handleStatusFilterChange('ACTIVE')}
                        disabled={loading}
                      >
                        <i className="fas fa-check-circle me-2"></i>
                        Activos
                        <span className="badge bg-success ms-2">{stats.active}</span>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-danger ${filterStatus === 'INACTIVE' ? 'active' : ''}`}
                        onClick={() => handleStatusFilterChange('INACTIVE')}
                        disabled={loading}
                      >
                        <i className="fas fa-archive me-2"></i>
                        Inactivos
                        <span className="badge bg-danger ms-2">{stats.inactive}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card card-table show-entire">
                <div className="card-body">
                  {/* Table Header */}
                  <div className="page-table-header mb-2">
                    <div className="row align-items-center">
                      <div className="col">
                        <div className="doctor-table-blk">
                          <h3>
                            Lista de Documentos 
                            <span className="ms-2 text-muted">
                              ({filterStatus === 'ALL' ? 'Todos' : filterStatus === 'ACTIVE' ? 'Activos' : 'Inactivos'})
                            </span>
                          </h3>
                          <div className="doctor-search-blk">
                            <div className="top-nav-search table-search-blk">
                              <form>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Buscar documentos..."
                                  value={searchText}
                                  onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Link className="btn">
                                  <img src={searchnormal || "/placeholder.svg"} alt="#" />
                                </Link>
                              </form>
                            </div>
                            <div className="add-group">
                              <Link to="/addappoinments" className="btn btn-primary add-pluss ms-2">
                                <img src={plusicon || "/placeholder.svg"} alt="#" />
                              </Link>
                              <button
                                onClick={handleRefresh}
                                className="btn btn-primary doctor-refresh ms-2"
                                disabled={loading}
                              >
                                {loading ? <Spin size="small" /> : <img src={refreshicon || "/placeholder.svg"} alt="#" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-auto text-end float-end ms-auto download-grp">
                        <Link to="#" className="me-2" title="Exportar PDF">
                          <img src={pdficon || "/placeholder.svg"} alt="#" />
                        </Link>
                        <Link to="#" className="me-2" title="Exportar Excel">
                          <img src={pdficon3 || "/placeholder.svg"} alt="#" />
                        </Link>
                        <Link to="#" title="Imprimir">
                          <img src={pdficon4 || "/placeholder.svg"} alt="#" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* /Table Header */}

                  <div className="table-responsive doctor-list">
                    <Table
                      loading={loading}
                      pagination={{
                        total: filteredDocuments.length,
                        showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} documentos`,
                        showSizeChanger: true,
                        onShowSizeChange: onShowSizeChange,
                        itemRender: itemRender,
                        pageSize: 10,
                        showQuickJumper: true,
                      }}
                      columns={columns}
                      dataSource={filteredDocuments}
                      rowSelection={rowSelection}
                      rowKey={(record) => record.id}
                      scroll={{ x: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-2">
                    <i className="fas fa-check-circle text-success" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h4 className="text-success">{stats.active}</h4>
                  <p className="mb-0">Documentos Activos</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-2">
                    <i className="fas fa-archive text-danger" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h4 className="text-danger">{stats.inactive}</h4>
                  <p className="mb-0">Documentos Inactivos</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <div className="mb-2">
                    <i className="fas fa-list text-info" style={{fontSize: '2rem'}}></i>
                  </div>
                  <h4 className="text-info">{stats.total}</h4>
                  <p className="mb-0">Total Documentos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de Vista Previa de PDF */}
          <Modal
            title={
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="fas fa-file-pdf me-2"></i>
                  {previewModal.fileName}
                </span>
                <button
                  onClick={handleDownloadFromModal}
                  className="btn btn-sm btn-outline-primary"
                  title="Descargar PDF"
                >
                  <i className="fas fa-download me-1"></i>
                  Descargar
                </button>
              </div>
            }
            open={previewModal.visible}
            onCancel={handleClosePreview}
            footer={null}
            width="70%"
            style={{ top: 50 }}
            bodyStyle={{ height: '60vh', padding: 0 }}
          >
            {previewModal.url && (
              <div style={{ width: '100%', height: '100%' }}>
                <iframe
                  src={`${previewModal.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                  title={previewModal.fileName}
                  loading="lazy"
                />
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  )
}

export default UserDocumentList