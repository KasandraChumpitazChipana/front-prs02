"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Grade, PeriodoAcademico, Student, Course } from '@/types';
import { PERIODOS_ACADEMICOS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const gradeFormSchema = z.object({
  studentId: z.string().min(1, { message: "Debe seleccionar un alumno." }),
  courseId: z.string().min(1, { message: "Debe seleccionar un curso." }),
  academicPeriod: z.enum(PERIODOS_ACADEMICOS as [PeriodoAcademico, ...PeriodoAcademico[]], {
    errorMap: () => ({ message: "Seleccione un periodo académico válido." }),
  }),
  evaluationType: z.string()
    .min(3, { message: "El tipo de evaluación debe tener al menos 3 caracteres y máximo 100." })
    .max(100, { message: "El tipo de evaluación no puede exceder los 100 caracteres." }),
  grade: z.coerce.number()
    .min(0, { message: "La calificación debe ser como mínimo 0 y no puede ser negativa." })
    .max(20, { message: "La calificación debe ser como máximo 20." }),
  evaluationDate: z.date({
    required_error: "La fecha de evaluación es requerida.",
  }).max(new Date(), { message: "La fecha de evaluación no puede ser en el futuro." }),
  remarks: z.string().max(500, { message: "Las observaciones no pueden exceder los 500 caracteres." }).optional().nullable(),
});

export type GradeFormData = z.infer<typeof gradeFormSchema>;

interface CalificacionFormProps {
  initialData?: Grade | null;
  alumnos: Student[];
  courses: Course[];
  onSubmit: (data: GradeFormData) => void;
  onCancel: () => void;
}

const getAutomaticRemark = (gradeValue: number | undefined | null): string => {
  if (gradeValue === null || gradeValue === undefined || isNaN(gradeValue)) return '';
  if (gradeValue >= 18 && gradeValue <= 20) return "AD - Logro Muy Satisfactorio";
  if (gradeValue >= 14 && gradeValue <= 17) return "A - Logro Satisfactorio";
  if (gradeValue >= 11 && gradeValue <= 13) return "B - Logro Básico";
  if (gradeValue >= 0 && gradeValue <= 10) return "C - Logro Inicial";
  return '';
};

export function CalificacionForm({ initialData, alumnos, courses, onSubmit, onCancel }: CalificacionFormProps) {
  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      evaluationDate: initialData.evaluationDate ? new Date(initialData.evaluationDate.replace(/-/g, '\/')) : new Date(), // Ensure date is parsed correctly
      grade: initialData.grade ?? 0,
      remarks: initialData.remarks || getAutomaticRemark(initialData.grade),
    } : {
      studentId: '',
      courseId: '',
      academicPeriod: PERIODOS_ACADEMICOS.length > 0 ? PERIODOS_ACADEMICOS[0] : undefined,
      evaluationType: '',
      grade: 0,
      evaluationDate: new Date(),
      remarks: getAutomaticRemark(0),
    },
  });

  const watchedGrade = form.watch('grade');

  useEffect(() => {
    const remark = getAutomaticRemark(watchedGrade);
    const currentRemark = form.getValues('remarks');
    const isPotentiallyAutomatic = !currentRemark || 
                                  Object.values({
                                    AD: "AD - Logro Muy Satisfactorio",
                                    A: "A - Logro Satisfactorio",
                                    B: "B - Logro Básico",
                                    C: "C - Logro Inicial"
                                  }).includes(currentRemark) ||
                                  currentRemark === ""; // Also consider empty as auto-fillable

    if (isPotentiallyAutomatic && remark) {
        form.setValue('remarks', remark, { shouldValidate: true, shouldDirty: true });
    } else if (isPotentiallyAutomatic && !remark && currentRemark) {
        form.setValue('remarks', '', { shouldValidate: true, shouldDirty: true });
    }

  }, [watchedGrade, form]);

  const handleSubmit = (data: GradeFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <ScrollArea className="max-h-[60vh] pr-4"> {/* Adjusted from 55vh to 60vh */}
          <div className="space-y-2 rounded-md border bg-card p-4 shadow-sm">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alumno</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un alumno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(alumnos || []).filter(student => !student.deleted).map(student => (
                        <SelectItem key={student.id} value={String(student.id)}>
                          {student.firstName} {student.lastName} ({student.gradeSection})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(courses || []).filter(course => !course.deleted).map(course => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.name} (Prof: {course.teacher})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academicPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodo Académico</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un periodo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERIODOS_ACADEMICOS.map(periodo => (
                        <SelectItem key={periodo} value={periodo}>{periodo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evaluationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evaluación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Examen Parcial, Tarea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación (0-20)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evaluationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Evaluación</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones automáticas o personalizadas..."
                      {...field}
                      value={field.value ?? ''}
                      className="min-h-[60px]" // Reduced min-height
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            {initialData ? 'Guardar Cambios' : 'Crear Calificación'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
