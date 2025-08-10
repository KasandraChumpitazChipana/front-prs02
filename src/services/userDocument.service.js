import UserDocument from '../types/UserDocument';
import axios from 'axios';

// Si no tienes apiClient configurado, crea una instancia de axios
const apiClient = axios.create({
    baseURL: '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptores para manejo de errores globales
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            // Error del servidor
            throw new Error(error.response.data?.message || 'Error del servidor');
        } else if (error.request) {
            // Error de red
            throw new Error('Error de conexión. Verifica tu conexión a internet.');
        } else {
            // Error de configuración
            throw new Error('Error en la configuración de la petición');
        }
    }
);

class UserDocumentService {
    constructor() {
        this.endpoint = 'https://8086-vallegrande-msuserdocum-u3inuptv0zt.ws-us120.gitpod.io/api/v1/user-documents';
    }

    /**
     * Obtiene todos los documentos activos
     * @returns {Promise<UserDocument[]>} Lista de documentos activos
     */
    async getAllActiveDocuments() {
        try {
            const { data } = await apiClient.get(this.endpoint);
            return data.map(document => UserDocument.fromJSON(document));
        } catch (error) {
            console.error('Error fetching active documents:', error);
            throw new Error('No se pudieron cargar los documentos activos');
        }
    }

    /**
     * Obtiene todos los documentos (activos e inactivos)
     * @returns {Promise<UserDocument[]>} Lista de todos los documentos
     */
    async getAllDocuments() {
        try {
            const { data } = await apiClient.get(`${this.endpoint}/all`);
            return data.map(document => UserDocument.fromJSON(document));
        } catch (error) {
            console.error('Error fetching all documents:', error);
            throw new Error('No se pudieron cargar todos los documentos');
        }
    }

    /**
     * Obtiene todos los documentos inactivos
     * @returns {Promise<UserDocument[]>} Lista de documentos inactivos
     */
    async getInactiveDocuments() {
        try {
            const { data } = await apiClient.get(`${this.endpoint}/inactive`);
            return data.map(document => UserDocument.fromJSON(document));
        } catch (error) {
            console.error('Error fetching inactive documents:', error);
            throw new Error('No se pudieron cargar los documentos inactivos');
        }
    }

    /**
     * Obtiene documentos por usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<UserDocument[]>} Lista de documentos del usuario
     */
    async getDocumentsByUserId(userId) {
        try {
            const { data } = await apiClient.get(`${this.endpoint}/user/${userId}`);
            return data.map(document => UserDocument.fromJSON(document));
        } catch (error) {
            console.error('Error fetching documents by user ID:', error);
            throw new Error('No se pudieron cargar los documentos del usuario');
        }
    }

    /**
     * Obtiene un documento por su ID
     * @param {string} id - ID del documento
     * @returns {Promise<UserDocument>} Documento encontrado
     */
    async getDocumentById(id) {
        try {
            const { data } = await apiClient.get(`${this.endpoint}/${id}`);
            return UserDocument.fromJSON(data);
        } catch (error) {
            console.error('Error fetching document by ID:', error);
            throw new Error('No se pudo encontrar el documento');
        }
    }

    /**
     * Crea un nuevo documento
     * @param {Object} documentData - Datos del documento
     * @returns {Promise<UserDocument>} Documento creado
     */
    async createDocument(documentData) {
        try {
            const { data } = await apiClient.post(this.endpoint, documentData);
            return UserDocument.fromJSON(data);
        } catch (error) {
            console.error('Error creating document:', error);
            throw new Error('No se pudo crear el documento');
        }
    }

    /**
     * Actualiza un documento existente
     * @param {string} id - ID del documento
     * @param {Object} documentData - Datos actualizados del documento
     * @returns {Promise<UserDocument>} Documento actualizado
     */
    async updateDocument(id, documentData) {
        try {
            const { data } = await apiClient.put(`${this.endpoint}/${id}`, documentData);
            return UserDocument.fromJSON(data);
        } catch (error) {
            console.error('Error updating document:', error);
            throw new Error('No se pudo actualizar el documento');
        }
    }

    /**
     * Activa un documento (Restaurar)
     * @param {string} id - ID del documento
     * @returns {Promise<UserDocument>} Documento activado
     */
    async activateDocument(id) {
        try {
            const { data } = await apiClient.patch(`${this.endpoint}/${id}/activate`);
            return UserDocument.fromJSON(data);
        } catch (error) {
            console.error('Error activating document:', error);
            throw new Error('No se pudo restaurar el documento');
        }
    }

    /**
     * Desactiva un documento (Eliminación lógica)
     * @param {string} id - ID del documento
     * @returns {Promise<UserDocument>} Documento desactivado
     */
    async deactivateDocument(id) {
        try {
            const { data } = await apiClient.patch(`${this.endpoint}/${id}/deactivate`);
            return UserDocument.fromJSON(data);
        } catch (error) {
            console.error('Error deactivating document:', error);
            throw new Error('No se pudo desactivar el documento');
        }
    }

    /**
     * Elimina un documento físicamente
     * @param {string} id - ID del documento
     * @returns {Promise<void>}
     */
    async deleteDocument(id) {
        try {
            await apiClient.delete(`${this.endpoint}/${id}`);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('No se pudo eliminar el documento');
        }
    }

    /**
     * Crea un nuevo documento usando el método estático de la clase
     * @param {string} userId - ID del usuario
     * @param {string} fileName - Nombre del archivo
     * @param {string} fileType - Tipo de archivo
     * @param {string} fileUrl - URL del archivo
     * @param {string} uploadedBy - Usuario que subió el archivo
     * @param {string} description - Descripción del documento
     * @returns {Promise<UserDocument>} Documento creado
     */
    async createNewDocument(userId, fileName, fileType, fileUrl, uploadedBy, description) {
        const documentData = {
            userId,
            fileName,
            fileType,
            fileUrl,
            uploadedBy,
            description
        };
        return await this.createDocument(documentData);
    }

    /**
     * Busca documentos por tipo de archivo
     * @param {string} fileType - Tipo de archivo
     * @returns {Promise<UserDocument[]>} Lista de documentos del tipo especificado
     */
    async getDocumentsByFileType(fileType) {
        try {
            const allDocuments = await this.getAllActiveDocuments();
            return allDocuments.filter(doc => doc.fileType === fileType);
        } catch (error) {
            console.error('Error fetching documents by file type:', error);
            throw new Error('No se pudieron filtrar los documentos por tipo');
        }
    }

    /**
     * Busca documentos por rango de fechas
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @returns {Promise<UserDocument[]>} Lista de documentos en el rango de fechas
     */
    async getDocumentsByDateRange(startDate, endDate) {
        try {
            const allDocuments = await this.getAllActiveDocuments();
            return allDocuments.filter(doc => {
                const uploadDate = new Date(doc.uploadedAt);
                return uploadDate >= startDate && uploadDate <= endDate;
            });
        } catch (error) {
            console.error('Error fetching documents by date range:', error);
            throw new Error('No se pudieron filtrar los documentos por fecha');
        }
    }

    /**
     * Obtiene estadísticas de documentos por usuario
     * @param {string} userId - ID del usuario
     * @returns {Promise<Object>} Estadísticas del usuario
     */
    async getUserDocumentStats(userId) {
        try {
            const userDocuments = await this.getDocumentsByUserId(userId);
            const allUserDocuments = await this.getAllDocuments();
            const userAllDocuments = allUserDocuments.filter(doc => doc.userId === userId);
            
            return {
                totalDocuments: userAllDocuments.length,
                activeDocuments: userDocuments.length,
                inactiveDocuments: userAllDocuments.filter(doc => !doc.isActive()).length,
                documentsByType: this._groupDocumentsByType(userDocuments)
            };
        } catch (error) {
            console.error('Error fetching user document stats:', error);
            throw new Error('No se pudieron cargar las estadísticas del usuario');
        }
    }

    /**
     * Agrupa documentos por tipo de archivo (método auxiliar)
     * @private
     * @param {UserDocument[]} documents - Lista de documentos
     * @returns {Object} Documentos agrupados por tipo
     */
    _groupDocumentsByType(documents) {
        return documents.reduce((acc, doc) => {
            const type = doc.fileType;
            if (!acc[type]) {
                acc[type] = 0;
            }
            acc[type]++;
            return acc;
        }, {});
    }

    /**
     * Operaciones en lote para activar múltiples documentos
     * @param {string[]} documentIds - Array de IDs de documentos
     * @returns {Promise<UserDocument[]>} Array de documentos activados
     */
    async batchActivateDocuments(documentIds) {
        try {
            const promises = documentIds.map(id => this.activateDocument(id));
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error in batch activate:', error);
            throw new Error('Error al activar documentos en lote');
        }
    }

    /**
     * Operaciones en lote para desactivar múltiples documentos
     * @param {string[]} documentIds - Array de IDs de documentos
     * @returns {Promise<UserDocument[]>} Array de documentos desactivados
     */
    async batchDeactivateDocuments(documentIds) {
        try {
            const promises = documentIds.map(id => this.deactivateDocument(id));
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error in batch deactivate:', error);
            throw new Error('Error al desactivar documentos en lote');
        }
    }
}

export default new UserDocumentService();