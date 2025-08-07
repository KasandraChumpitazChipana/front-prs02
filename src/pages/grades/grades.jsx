
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Grade, Student, Course, BackendGrade } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit2, Trash2, Undo2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EntityFormModal } from '@/components/shared/entity-form-modal';
import { CalificacionForm, type GradeFormData } from '@/components/forms/calificacion-form';
import { GradePreviewModal } from '@/components/shared/grade-preview-modal';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/api-config';

const API_GRADES_URL_BASE = `${API_BASE_URL}/api/grades`;
const API_STUDENTS_URL = `${API_BASE_URL}/api/students`;
const API_COURSES_URL = `${API_BASE_URL}/api/courses`;

const COMMON_FETCH_HEADERS = {};
const POST_PUT_FETCH_HEADERS = { ...COMMON_FETCH_HEADERS, 'Content-Type': 'application/json' };

const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";
const ITEMS_PER_PAGE = 10;

const PREDEFINED_GRADE_SECTIONS: string[] = [];
const gradesList = ["1ro", "2do", "3ro", "4to", "5to"];
const sectionsList = ["A", "B", "C", "D"];
gradesList.forEach(grade => {
  sectionsList.forEach(section => {
    PREDEFINED_GRADE_SECTIONS.push(`${grade} ${section}`);
  });
});


interface RenderTableProps<T extends { id: string; deleted?: boolean }> {
  data: T[];
  columns: Array<{ key: keyof T | string; header: string; render?: (item: T) => React.ReactNode }>;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPreview?: (item: T) => void;
}

function RenderTable<T extends { id: string; deleted?: boolean }>({ data, columns, onEdit, onDelete, onRestore, onPreview }: RenderTableProps<T>) {
   if (data.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">No hay registros para mostrar.</p>;
  }
  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}
            <TableHead className="text-right w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id}>
              {columns.map(col => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onPreview && <DropdownMenuItem onClick={() => onPreview(item)}><Eye className="mr-2 h-4 w-4" /> Ver Detalles</DropdownMenuItem>}
                    {onEdit && !item.deleted && <DropdownMenuItem onClick={() => onEdit(item)}><Edit2 className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>}
                    {onDelete && !item.deleted && <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>}
                    {onRestore && item.deleted && <DropdownMenuItem onClick={() => onRestore(item.id)}><Undo2 className="mr-2 h-4 w-4" /> Restaurar</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const mapBackendGradeToFrontend = (backendGrade: BackendGrade, isInactiveFetch: boolean = false): Grade => {
  let formattedDate = "";
  if (Array.isArray(backendGrade.evaluationDate) && backendGrade.evaluationDate.length >= 3) {
    const year = backendGrade.evaluationDate[0];
    const month = backendGrade.evaluationDate[1]; 
    const day = backendGrade.evaluationDate[2];
    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const dateObj = new Date(year, month - 1, day); 
        if (!isNaN(dateObj.getTime())) {
            formattedDate = format(dateObj, "yyyy-MM-dd");
        } else {
            console.warn(`Invalid date array components from backend, resulted in invalid Date object: ${backendGrade.evaluationDate}`);
        }
    } else {
         console.warn(`Invalid date array values from backend: ${backendGrade.evaluationDate}`);
    }
  } else if (typeof backendGrade.evaluationDate === 'string') { 
     try {
        const dateObj = new Date(backendGrade.evaluationDate.replace(/-/g, '\/')); 
        if (!isNaN(dateObj.getTime())) {
            formattedDate = format(dateObj, "yyyy-MM-dd");
        } else {
            console.warn(`Invalid date string from backend: ${backendGrade.evaluationDate}`);
        }
    } catch (e) {
        console.error(`Error parsing date string from backend: ${backendGrade.evaluationDate}`, e);
    }
  } else if (backendGrade.evaluationDate) {
    console.warn(`Unexpected evaluationDate format from backend:`, backendGrade.evaluationDate);
  }

  return {
    id: String(backendGrade.id),
    studentId: String(backendGrade.studentId),
    courseId: String(backendGrade.courseId),
    academicPeriod: backendGrade.academicPeriod,
    evaluationType: backendGrade.evaluationType,
    grade: backendGrade.grade,
    evaluationDate: formattedDate, 
    remarks: backendGrade.remarks,
    deleted: typeof backendGrade.deleted === 'boolean' ? backendGrade.deleted : (isInactiveFetch || false),
  };
};


const mapGradeFormToApiPayload = (data: GradeFormData): Omit<BackendGrade, 'id' | 'deleted' | 'evaluationDate'> & { evaluationDate: string } => {
  const payload: any = { 
    studentId: data.studentId,
    courseId: data.courseId,
    academicPeriod: data.academicPeriod,
    evaluationType: data.evaluationType,
    grade: data.grade,
    evaluationDate: format(data.evaluationDate, "yyyy-MM-dd"), 
    remarks: data.remarks || '',
  };
  return payload;
};

export default function CalificacionesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedGradeForPreview, setSelectedGradeForPreview] = useState<Grade | null>(null);

  const [activeTab, setActiveTab] = useState<'activos' | 'inactivos'>('activos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('');
  const [selectedGradeSectionFilter, setSelectedGradeSectionFilter] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    let currentGradesUrl = API_GRADES_URL_BASE;
    if (activeTab === 'inactivos') {
      currentGradesUrl = `${API_GRADES_URL_BASE}/inactive`;
    }

    console.log(`Fetching grades from: ${currentGradesUrl}`);
    console.log(`Fetching students from: ${API_STUDENTS_URL}`);
    console.log(`Fetching courses from: ${API_COURSES_URL}`);

    try {
      const [gradesRes, studentsRes, coursesRes] = await Promise.all([
        fetch(currentGradesUrl, { headers: COMMON_FETCH_HEADERS }),
        fetch(API_STUDENTS_URL, { headers: COMMON_FETCH_HEADERS }),
        fetch(API_COURSES_URL, { headers: COMMON_FETCH_HEADERS })
      ]);

      // Process Grades
      if (!gradesRes.ok) {
        let errorText = `Error del servidor al cargar calificaciones: ${gradesRes.status}`;
        try {
            const serverErrorText = await gradesRes.text();
            errorText += ` - ${serverErrorText.substring(0, 200)}`;
            if (serverResponseText.toLowerCase().includes("<html")) {
                console.warn(
                    "La API de calificaciones devolvió HTML. Revisa la URL, el estado del servidor y la pestaña 'Network'. URL: " + currentGradesUrl
                );
            }
        } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      const gradesContentType = gradesRes.headers.get("content-type");
      if (!gradesContentType || !gradesContentType.includes("application/json")) {
        let errorDetail = `Respuesta inesperada del servidor al cargar calificaciones (no es JSON).`;
        try {
            const serverResponseText = await gradesRes.text();
            errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`;
            if (serverResponseText.toLowerCase().includes("<html")) {
                console.warn(
                    "La API de calificaciones devolvió HTML en lugar de JSON. URL: " + currentGradesUrl +
                    " Revisa la pestaña 'Network' en las herramientas de desarrollador de tu navegador para ver el contenido HTML exacto."
                );
            }
        } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      const backendGradesData: BackendGrade[] = await gradesRes.json();
      const isInactiveData = activeTab === 'inactivos';
      setGrades(backendGradesData.map(g => mapBackendGradeToFrontend(g, isInactiveData)));

      // Process Students
      if (!studentsRes.ok) {
        let errorText = `Error del servidor al cargar estudiantes: ${studentsRes.status}`;
        try { const serverErrorText = await studentsRes.text(); errorText += ` - ${serverErrorText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      const studentsContentType = studentsRes.headers.get("content-type");
      if (!studentsContentType || !studentsContentType.includes("application/json")) {
        let errorDetail = `Respuesta inesperada del servidor al cargar estudiantes (no es JSON).`;
        try { const serverResponseText = await studentsRes.text(); errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      const studentsDataFromApi: any[] = await studentsRes.json();
      const formattedStudents: Student[] = studentsDataFromApi.map(s => ({ ...s, id: String(s.id), deleted: s.deleted || false }));
      setStudents(formattedStudents);


       // Process Courses
      if (!coursesRes.ok) {
        let errorText = `Error del servidor al cargar cursos: ${coursesRes.status}`;
        try { const serverErrorText = await coursesRes.text(); errorText += ` - ${serverErrorText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      const coursesContentType = coursesRes.headers.get("content-type");
      if (!coursesContentType || !coursesContentType.includes("application/json")) {
        let errorDetail = `Respuesta inesperada del servidor al cargar cursos (no es JSON).`;
        try { const serverResponseText = await coursesRes.text(); errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      const coursesDataFromApi: Course[] = await coursesRes.json();
      const formattedCourses: Course[] = coursesDataFromApi.map(c => ({ ...c, id: String(c.id), deleted: c.deleted || false }));
      setCourses(formattedCourses);

    } catch (error) {
      console.error("Error en fetchData:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error al Cargar Datos",
        description: `No se pudieron obtener los datos necesarios. ${errorMessage}. Verifica tu conexión y URLs de API.`,
        variant: "destructive",
        duration: 10000,
      });
      setGrades([]);
      setStudents([]); 
      setCourses([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourseFilter, selectedGradeSectionFilter, activeTab]);

  const handleAddGrade = async (formData: GradeFormData) => {
    try {
      const apiPayload = mapGradeFormToApiPayload(formData);
      console.log(`Adding grade with payload:`, apiPayload, `to ${API_GRADES_URL_BASE}`);
      const response = await fetch(API_GRADES_URL_BASE, {
        method: 'POST',
        headers: POST_PUT_FETCH_HEADERS,
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        let errorText = `Error del servidor al crear calificación: ${response.status}`;
        try { const serverErrorText = await response.text(); errorText += ` - ${serverErrorText.substring(0, 200)}`;} catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      
      const contentType = response.headers.get("content-type");
      if (response.status !== 201 || !contentType || !contentType.includes("application/json")) {
         let errorDetail = `Respuesta inesperada del servidor al crear (esperaba JSON, status 201).`;
        try { const serverResponseText = await response.text(); errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorDetail);
      }
      await response.json(); 
      toast({ title: "Calificación Creada", description: `Se ha registrado una nueva calificación.` });
      fetchData(); 
      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error en handleAddGrade:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error al Crear Calificación",
        description: `No se pudo crear la calificación. ${errorMessage}.`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  const handleUpdateGrade = async (formData: GradeFormData) => {
    if (!editingGrade) return;
    try {
      const apiPayload = mapGradeFormToApiPayload(formData);
      const payloadForPut = { 
        ...apiPayload, 
        id: editingGrade.id, 
        deleted: editingGrade.deleted 
      };

      const updateUrl = `${API_GRADES_URL_BASE}/${editingGrade.id}`;
      console.log(`Updating grade ID ${editingGrade.id} with payload:`, payloadForPut, `to ${updateUrl}`);
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: POST_PUT_FETCH_HEADERS,
        body: JSON.stringify(payloadForPut),
      });

      if (!response.ok) {
        let errorText = `Error del servidor al actualizar calificación: ${response.status}`;
        try { const serverErrorText = await response.text(); errorText += ` - ${serverErrorText.substring(0, 200)}`; } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }

      if (response.status === 200) { 
         const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          await response.json(); 
        }
      } else if (response.status !== 204) { 
         let errorDetail = `Respuesta inesperada del servidor al actualizar (status ${response.status}).`;
          try { const serverResponseText = await response.text(); errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`; } catch (e) { /* ignore */ }
          throw new Error(errorDetail);
      }

      toast({ title: "Calificación Actualizada", description: `La calificación ha sido actualizada.` });
      fetchData();
      setIsFormModalOpen(false);
      setEditingGrade(null);
    } catch (error) {
      console.error("Error en handleUpdateGrade:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error al Actualizar Calificación",
        description: `No se pudo actualizar la calificación. ${errorMessage}.`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  const handleDeleteGrade = async (id: string) => {
    const grade = grades.find(g => g.id === id);
    if (!grade) return;

    try {
      const deleteUrl = `${API_GRADES_URL_BASE}/${id}`;
      console.log(`Deleting (logically) grade ID ${id} via DELETE to ${deleteUrl}`);
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: COMMON_FETCH_HEADERS 
      });

      if (!response.ok && response.status !== 204) { 
        let errorText = `Error del servidor al eliminar calificación: ${response.status}`;
        try {
            const serverErrorText = await response.text();
            if (serverErrorText && serverErrorText.trim() !== "") { 
                 errorText += ` - ${serverErrorText.substring(0,200)}`;
            }
        } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      
      if (response.status === 200) { 
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          await response.json(); 
        }
      }
      
      toast({ title: "Calificación Eliminada", description: `La calificación ha sido marcada como inactiva.`, variant: 'destructive' });
      fetchData(); 
    } catch (error) {
      console.error("Error en handleDeleteGrade:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error al Eliminar Calificación",
        description: `No se pudo eliminar la calificación. ${errorMessage}.`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  const handleRestoreGrade = async (id: string) => {
    const grade = grades.find(g => g.id === id);
    if (!grade) return;
    try {
      const restoreUrl = `${API_GRADES_URL_BASE}/${id}/restore`;
      console.log(`Restoring grade ID ${id} via PUT to ${restoreUrl}`);
      const response = await fetch(restoreUrl, {
        method: 'PUT',
        headers: COMMON_FETCH_HEADERS 
      });

      if (!response.ok && response.status !== 204 && response.status !== 200) { 
        let errorText = `Error del servidor al restaurar calificación: ${response.status}`;
        try {
            const serverErrorText = await response.text();
            if(serverErrorText && serverErrorText.trim() !== "") { 
                errorText += ` - ${serverErrorText.substring(0,200)}`;
            }
        } catch (e) { /* ignore */ }
        throw new Error(errorText);
      }
      
      if (response.status === 200) { 
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            let errorDetail = `Respuesta inesperada del servidor al restaurar (no es JSON para status 200).`;
             try { const serverResponseText = await response.text(); errorDetail += ` Contenido: ${serverResponseText.substring(0, 200)}`; } catch (e) {/*ignore*/}
            throw new Error(errorDetail);
          }
          await response.json(); 
      }
      
      toast({ title: "Calificación Restaurada", description: `La calificación ha sido reactivada.` });
      fetchData(); 
    } catch (error) {
      console.error("Error en handleRestoreGrade:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error al Restaurar Calificación",
        description: `No se pudo restaurar la calificación. ${errorMessage}.`,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setIsFormModalOpen(true);
  };

  const openAddModal = () => {
    setEditingGrade(null);
    setIsFormModalOpen(true);
  };

  const openPreviewModal = (grade: Grade) => {
    setSelectedGradeForPreview(grade);
    setIsPreviewModalOpen(true);
  };

  const getStudentName = useCallback((studentId: string) => {
    const student = students.find(s => String(s.id) === String(studentId));
    return student ? `${student.firstName} ${student.lastName}` : 'Desconocido';
  }, [students]);

  const getStudentGradeSection = useCallback((studentId: string) => {
    const student = students.find(s => String(s.id) === String(studentId));
    return student ? student.gradeSection : 'N/A';
  }, [students]);

  const getCourseName = useCallback((courseId: string) => {
    const course = courses.find(c => String(c.id) === String(courseId));
    return course ? course.name : 'Desconocido';
  }, [courses]);

  const filteredGrades = useMemo(() => {
    return grades 
      .filter(g => { 
        if (!selectedCourseFilter || selectedCourseFilter === ALL_ITEMS_FILTER_VALUE) return true;
        return g.courseId === selectedCourseFilter;
      })
      .filter(g => { 
        if (!selectedGradeSectionFilter || selectedGradeSectionFilter === ALL_ITEMS_FILTER_VALUE) return true;
        const student = students.find(s => s.id === g.studentId);
        return student ? student.gradeSection === selectedGradeSectionFilter : false;
      })
      .filter(g => { 
        const studentName = getStudentName(g.studentId).toLowerCase();
        const courseName = getCourseName(g.courseId).toLowerCase();
        const search = searchTerm.toLowerCase();
        return studentName.includes(search) || 
               courseName.includes(search) || 
               g.evaluationType.toLowerCase().includes(search) || 
               g.academicPeriod.toLowerCase().includes(search) ||
               String(g.grade).includes(search);
      });
  }, [grades, searchTerm, getStudentName, getCourseName, selectedCourseFilter, selectedGradeSectionFilter, students]);

  const totalPages = Math.ceil(filteredGrades.length / ITEMS_PER_PAGE);
  const paginatedGrades = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGrades.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredGrades, currentPage]);


  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


  const gradesColumns = [
    { key: 'studentId', header: 'Estudiante', render: (item: Grade) => getStudentName(item.studentId) },
    { key: 'studentGradeSection', header: 'Grado y Sección', render: (item: Grade) => getStudentGradeSection(item.studentId) },
    { key: 'courseId', header: 'Curso', render: (item: Grade) => getCourseName(item.courseId) },
    { key: 'academicPeriod', header: 'Periodo' },
    { key: 'evaluationType', header: 'Tipo Evaluación' },
    { key: 'grade', header: 'Calificación' },
    { key: 'evaluationDate', header: 'Fecha Eval.', render: (item: Grade) => {
        try {
          if (!item.evaluationDate) return '-';
          // Ensure date is parsed as YYYY/MM/DD to avoid timezone issues with Date constructor
          const dateObj = new Date(item.evaluationDate.replace(/-/g, '/'));
          if (!isNaN(dateObj.getTime())) {
               return format(dateObj, "dd/MM/yyyy", { locale: es });
          }
          return item.evaluationDate; 
        } catch(e) {
          console.warn("Error formatting evaluationDate in table:", item.evaluationDate, e);
          return item.evaluationDate; 
        }
      }
    },
    { key: 'remarks', header: 'Observaciones' },
  ];

  const activeStudentsForForm = useMemo(() => students.filter(s => !s.deleted), [students]);
  const activeCoursesForForm = useMemo(() => courses.filter(c => !c.deleted), [courses]);

  return (
    <div className="container mx-auto py-4">
      <PageHeader title="Registro Auxiliar de Notas">
        <Button onClick={openAddModal} size="sm" disabled={activeStudentsForForm.length === 0 || activeCoursesForForm.length === 0}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Calificación
        </Button>
        {(activeStudentsForForm.length === 0 || activeCoursesForForm.length === 0) && !isLoading && (
             <p className="text-xs text-destructive mt-1">Debe haber estudiantes y cursos activos para agregar calificaciones.</p>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select 
          value={selectedCourseFilter === '' ? ALL_ITEMS_FILTER_VALUE : selectedCourseFilter} 
          onValueChange={(value) => {
            if (value === ALL_ITEMS_FILTER_VALUE) {
              setSelectedCourseFilter('');
            } else {
              setSelectedCourseFilter(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos los Cursos</SelectItem>
            {activeCoursesForForm.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedGradeSectionFilter === '' ? ALL_ITEMS_FILTER_VALUE : selectedGradeSectionFilter} 
          onValueChange={(value) => {
            if (value === ALL_ITEMS_FILTER_VALUE) {
              setSelectedGradeSectionFilter('');
            } else {
              setSelectedGradeSectionFilter(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrar por Grado y Sección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos los Grados/Secc.</SelectItem>
            {PREDEFINED_GRADE_SECTIONS.map(gs => (
              <SelectItem key={gs} value={gs}>
                {gs}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Buscar por nombre, tipo, calificación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto sm:flex-grow max-w-xs" 
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'activos' | 'inactivos')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/3">
          <TabsTrigger value="activos">Activas</TabsTrigger>
          <TabsTrigger value="inactivos">Inactivas</TabsTrigger>
        </TabsList>
        {isLoading ? (
          <p className="py-10 text-center text-muted-foreground">Cargando calificaciones...</p>
        ) : (
          <>
            <TabsContent value="activos">
                <RenderTable 
                    data={paginatedGrades} 
                    columns={gradesColumns} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteGrade} 
                    onPreview={openPreviewModal}
                 />
            </TabsContent>
            <TabsContent value="inactivos">
                 <RenderTable 
                    data={paginatedGrades} 
                    columns={gradesColumns} 
                    onRestore={handleRestoreGrade} 
                    onPreview={openPreviewModal}
                />
            </TabsContent>
            {filteredGrades.length > 0 && (
              <div className="mt-4 flex items-center justify-end space-x-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </Tabs>

      <EntityFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingGrade ? 'Editar Calificación' : 'Agregar Nueva Calificación'}
        description={editingGrade ? `Actualizando calificación.` : "Complete los campos para registrar una nueva calificación."}
      >
        <CalificacionForm
          initialData={editingGrade}
          alumnos={activeStudentsForForm}
          courses={activeCoursesForForm}
          onSubmit={editingGrade ? handleUpdateGrade : handleAddGrade}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </EntityFormModal>

      <GradePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        grade={selectedGradeForPreview}
        getStudentName={getStudentName}
        getStudentGradeSection={getStudentGradeSection}
        getCourseName={getCourseName}
      />
    </div>
  );
}


    
