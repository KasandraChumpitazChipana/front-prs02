import React from "react";
import { Route } from "react-router-dom";
// Corrección de las rutas de importación - eliminar "./components/" del inicio
import SettingsThem from "./settings/SettingsThem";
//Doctor
import DoctorList from "./doctor/DoctorList";
import AddDoctor from "./doctor/AddDoctor";
import EditDoctor from "./doctor/EditDoctor";
import DoctorProfile from "./doctor/DoctorProfile";
//Patients...
import PatientsList from "./patients/PatientsList";
import AddPatients from "./patients/AddPatients";
// import EditPatients from "./patients/EditPatients"; // REMOVIDO
// import PatientsProfile from "./patients/PatientsProfile"; // REMOVIDO
import AppoinmentList from "./userdocument/AppoinmentList";
import AddAppoinments from "./userdocument/AddAppoinments";
import EditAppoinments from "./userdocument/EditAppoinments";
//DoctorSchedule
import ScheduleList from "./doctorschedule/ScheduleList";
import AddSchedule from "./doctorschedule/AddSchedule";
import EditSchedule from "./doctorschedule/EditSchedule";
//Departments
import DepartmentList from "./department/DepartmentList";
import AddDepartment from "./department/AddDepartment";
import EditDepartment from "./department/EditDepartment";
import StaffList from "./staff/StafList";
import AddStaff from "./staff/Add-Staff";
import StaffProfile from "./staff/StaffProfile";
import ProvidentFund from "./accounts/ProvidentFund";
import Invoice from "./accounts/Invoice";
import Create_Invoice from "./accounts/Create_Invoice";
import Payments from "./accounts/Payments";
import Add_Payment from "./accounts/Add_Payment";
import Expenses from "./accounts/Expenses";
import Add_Expense from "./accounts/Add_Expense";
import Taxes from "./accounts/Taxes";
import Add_Tax from "./accounts/Add_Tax";
import EmployeeSalary from "./Payroll/EmployeeSalary/EmployeeSalary";

import Inbox from "./email/Inbox";
import AddLeave from "./staff/AddLeave";
import Attendence from "./staff/Attendence";
import Leave from "./staff/Leave";
import ComposeMail from "./email/ComposeMail";
import MailView from "./email/MailView";
import UserActivity from "./activity/UserActivity";
import AddEmployeeSalary from "./Payroll/EmployeeSalary/AddEmployeeSalary";
import EditStaff from "./staff/EditStaff";
import EditLeave from "./staff/EditLeave";
import Holiday from "./staff/Holiday";
import Add_ProviderFund from "./accounts/Add_ProviderFund";
import ExpensesReport from "./ExpenseReport/Expenses/ExpensesReport";
import AddExpenses from "./ExpenseReport/Expenses/AddExpenses";
import Invoice_Report from "./ExpenseReport/Invoice-report/Invoice_Report";
import OverDue from "./Invoice/Invoice-List/Overdue-Invoice/OverDue";
import InvoiceList from "./Invoice/Invoice-List/InvoiceList";
import Paid_Invoice from "./Invoice/Invoice-List/Paid-Invoice/Paid_Invoice";
import Draft_Invoice from "./Invoice/Invoice-List/Draft_Invoice/Draft_Invoice";
import Recurring_Invoice from "./Invoice/Invoice-List/Recurring_Invoice/Recurring_Invoice";
import Cancelled_Invoice from "./Invoice/Invoice-List/Cancelled_Invoice/Cancelled_Invoice";
import Invoice_Grid from "./Invoice/Invoices_Grid/Invoice_Grid";
import Add_Invoices from "./Invoice/Add_Invoices/Add_Invoices";
import Edit_Invoices from "./Invoice/Edit_Invoices/Edit_Invoices";
import Invoice_Details from "./Invoice/Invoice_Details/Invoice_Details";
import Invoice_GeneralSettings from "./Invoice/Invoice_Settings/General_Settings/Invoice_GeneralSettings";
import Tax_Settings from "./Invoice/Invoice_Settings/Tax_Settings/Tax_Settings";
import Bank_Settings from "./Invoice/Invoice_Settings/Bank_Settings/Bank_Settings";
import BasicInput from "./Forms/BasicInput";
import InputGroups from "./Forms/InputGroups";
import HorizontalForm from "./Forms/HorizontalForm";
import VerticalForm from "./Forms/VerticalForm";
import BasicTable from "./Tables/BasicTable";
import DataTable from "./Tables/DataTable";
import UiKit from "./Ui_Elements/UiKit";
import Typography from "./Ui_Elements/Typography";
import ServerError from "./pages/login/ServerError";
import EditEmployeeSalery from "./Payroll/EmployeeSalary/EditEmployeeSalery";

//Students
import StudentList from "../pages/students/StudentList";
import AddStudent from "../pages/students/AddStudent";
import EditStudent from "../pages/students/EditStudent";
import StudentProfile from "../pages/students/StudentProfile";
//Enrollments
import EnrollmentList from "../pages/enrollments/EnrollmentList";
import AddEnrollment from "../pages/enrollments/AddEnrollment";
import EditEnrollment from "../pages/enrollments/EditEnrollment";

import BlankPage from "./pages/login/BlankPage";
import Doctor_Dashboard from "./Dashboard/Doctor_Dashboard/Doctor_Dashboard";
import Admin_Dashboard from "./Dashboard/Admin_Dashboard/Admin_Dashboard";
import Patient_Dashboard from "./Dashboard/Patient_Dashboard/Patient_Dashboard";
import Doctor_Settings from "./Dashboard/Doctor_Dashboard/Doctor_Settings";
// import Patient_Settings from "./patients/Patient_Settings"; // REMOVIDO
import Staff_Settings from "./staff/Staff-Settings";
import Edit_Provident from "./accounts/Edit_Provident";
import Edit_Taxes from "./accounts/Edit_Taxes";
import Edit_Expenses from "./ExpenseReport/Expenses/Edit_Expenses";
import Edit_Payment from "./accounts/Edit_Payment";
import Payslip from "./Payroll/Payslip";
import Setting from "./settings/Setting";
import Profile from "./Profile";

import Justifications from "./staff/Justifications";

const AppRoutes = [
  // Rutas generales
  <Route key="attendances" path="/attendances" element={<Attendence />} />,
  <Route key="Justifications" path="/Justifications" element={<Justifications />} />,
  <Route key="server-error" path="/server-error" element={<ServerError />} />,
  <Route key="blankpage" path="/blankpage" element={<BlankPage />} />,
  <Route key="profile" path="/profile" element={<Profile />} />,
  <Route key="settings" path="/settings" element={<Setting />} />,
  <Route key="settingsthem" path="/settingsthem" element={<SettingsThem />} />,
  
  // Rutas de Doctores
  <Route key="doctorlist" path="/doctorlist" element={<DoctorList />} />,
  <Route key="add-doctor" path="/add-doctor" element={<AddDoctor />} />,
  <Route key="editdoctor" path="/editdoctor" element={<EditDoctor />} />,
  <Route key="doctorprofile" path="/doctorprofile" element={<DoctorProfile />} />,
  <Route key="doctor-setting" path="/doctor-setting" element={<Doctor_Settings />} />,
  
  // Rutas de Pacientes/Usuarios - ACTUALIZADAS
  <Route key="patients" path="/patients" element={<PatientsList />} />,
  <Route key="patientslist" path="/patientslist" element={<PatientsList />} />,
  <Route key="addpatients" path="/addpatients" element={<AddPatients />} />,
  <Route key="editpatients" path="/editpatients/:id" element={<AddPatients />} />,
  
  // Rutas de Documentos/Citas - ACTUALIZADAS PARA SOPORTE DE EDICIÓN
  <Route key="appoinmentlist" path="/appoinmentlist" element={<AppoinmentList />} />,
  <Route key="addappoinments" path="/addappoinments" element={<AddAppoinments />} />,
  <Route key="editappoinments-with-id" path="/editappoinments/:id" element={<AddAppoinments />} />,
  <Route key="editappoinments" path="/editappoinments" element={<EditAppoinments />} />,
  
  // Rutas alternativas para documentos (manteniendo compatibilidad)
  <Route key="user-documents-list" path="/user-documents" element={<AppoinmentList />} />,
  <Route key="add-user-document" path="/add-user-document" element={<AddAppoinments />} />,
  <Route key="edit-user-document" path="/edit-user-document/:id" element={<AddAppoinments />} />,
  
  // Rutas de Horarios
  <Route key="schedulelist" path="/schedulelist" element={<ScheduleList />} />,
  <Route key="addschedule" path="/addschedule" element={<AddSchedule />} />,
  <Route key="editschedule" path="/editschedule" element={<EditSchedule />} />,
  
  // Rutas de Departamentos
  <Route key="departmentlist" path="/departmentlist" element={<DepartmentList />} />,
  <Route key="add-department" path="/add-department" element={<AddDepartment />} />,
  <Route key="editdepartment" path="/editdepartment" element={<EditDepartment />} />,
  
  // Rutas de Personal
  <Route key="stafflist" path="/stafflist" element={<StaffList />} />,
  <Route key="addstaff" path="/addstaff" element={<AddStaff />} />,
  <Route key="editstaff" path="/editstaff" element={<EditStaff />} />,
  <Route key="staffprofile" path="/staffprofile" element={<StaffProfile />} />,
  <Route key="leave" path="/leave" element={<Leave />} />,
  <Route key="add-leave" path="/add-leave" element={<AddLeave />} />,
  <Route key="editleave" path="/editleave" element={<EditLeave />} />,
  <Route key="attendence" path="/attendence" element={<Attendence />} />,
  <Route key="holiday" path="/holiday" element={<Holiday />} />,
  <Route key="staff-settings" path="/staff-settings" element={<Staff_Settings />} />,
  
  // Rutas de Cuentas y Finanzas
  <Route key="providentfund" path="/providentfund" element={<ProvidentFund />} />,
  <Route key="add-providerfund" path="/add-providerfund" element={<Add_ProviderFund />} />,
  <Route key="invoicelist" path="/invoicelist" element={<Invoice />} />,
  <Route key="createinvoice" path="/createinvoice" element={<Create_Invoice />} />,
  <Route key="payments" path="/payments" element={<Payments />} />,
  <Route key="addpayment" path="/addpayment" element={<Add_Payment />} />,
  <Route key="expenses" path="/expenses" element={<Expenses />} />,
  <Route key="addexpense" path="/addexpense" element={<Add_Expense />} />,
  <Route key="taxes" path="/taxes" element={<Taxes />} />,
  <Route key="edit-taxes" path="/edit-taxes" element={<Edit_Taxes />} />,
  <Route key="addtax" path="/addtax" element={<Add_Tax />} />,
  <Route key="edit-provident" path="/edit-provident" element={<Edit_Provident />} />,
  <Route key="edit-payment" path="/edit-payment" element={<Edit_Payment />} />,
  
  // Rutas de Nómina
  <Route key="employeesalary" path="/employeesalary" element={<EmployeeSalary />} />,
  <Route key="addsalary" path="/addsalary" element={<AddEmployeeSalary />} />,
  <Route key="editsalary" path="/editsalary" element={<EditEmployeeSalery />} />,
  <Route key="payslip" path="/payslip" element={<Payslip />} />,
  
  // Rutas de Email
  <Route key="inbox" path="/inbox" element={<Inbox />} />,
  <Route key="compose-mail" path="/compose-mail" element={<ComposeMail />} />,
  <Route key="mail-view" path="/mail-view" element={<MailView />} />,
  
  // Rutas de Actividad y Reportes
  <Route key="user-activity" path="/user-activity" element={<UserActivity />} />,
  <Route key="expense-Report" path="/expense-Report" element={<ExpensesReport />} />,
  <Route key="add-expense" path="/add-expense" element={<AddExpenses />} />,
  <Route key="invoice-report" path="/invoice-report" element={<Invoice_Report />} />,
  <Route key="edit-expenses" path="/edit-expenses" element={<Edit_Expenses />} />,
  
  // Rutas de Facturación
  <Route key="invoice-list" path="/invoice-list" element={<InvoiceList />} />,
  <Route key="paid-invoice" path="/paid-invoice" element={<Paid_Invoice />} />,
  <Route key="overdue-invoice" path="/overdue-invoice" element={<OverDue />} />,
  <Route key="draft-invoice" path="/draft-invoice" element={<Draft_Invoice />} />,
  <Route key="recurring-invoice" path="/recurring-invoice" element={<Recurring_Invoice />} />,
  <Route key="cancelled-invoice" path="/cancelled-invoice" element={<Cancelled_Invoice />} />,
  <Route key="invoice-grid" path="/invoice-grid" element={<Invoice_Grid />} />,
  <Route key="add-invoice" path="/add-invoice" element={<Add_Invoices />} />,
  <Route key="edit-invoice" path="/edit-invoice" element={<Edit_Invoices />} />,
  <Route key="invoice-details" path="/invoice-details" element={<Invoice_Details />} />,
  <Route key="invoice-settings" path="/invoice-settings" element={<Invoice_GeneralSettings />} />,
  <Route key="tax-settings" path="/tax-settings" element={<Tax_Settings />} />,
  <Route key="bank-settings" path="/bank-settings" element={<Bank_Settings />} />,
  
  // Rutas de UI Elements y Forms
  <Route key="ui-kit" path="/ui-kit" element={<UiKit />} />,
  <Route key="typography" path="/typography" element={<Typography />} />,
  <Route key="basic-input" path="/basic-input" element={<BasicInput />} />,
  <Route key="inputgroup" path="/inputgroup" element={<InputGroups />} />,
  <Route key="horizontal-form" path="/horizontal-form" element={<HorizontalForm />} />,
  <Route key="vertical-form" path="/vertical-form" element={<VerticalForm />} />,
  <Route key="basic-table" path="/basic-table" element={<BasicTable />} />,
  <Route key="data-table" path="/data-table" element={<DataTable />} />,
  
  // Rutas de Dashboard
  <Route key="admin-dashboard" path="/admin-dashboard" element={<Admin_Dashboard />} />,
  
  // Rutas de Estudiantes
  <Route key="studentlist" path="/studentlist" element={<StudentList />} />,
  <Route key="add-student" path="/add-student" element={<AddStudent />} />,
  <Route key="editstudent" path="/editstudent/:id" element={<EditStudent />} />,
  <Route key="studentprofile" path="/studentprofile/:id" element={<StudentProfile />} />,
  
  // Rutas de Matrículas
  <Route key="enrollmentlist" path="/enrollmentlist" element={<EnrollmentList />} />,
  <Route key="add-enrollment" path="/add-enrollment" element={<AddEnrollment />} />,
  <Route key="editenrollment" path="/editenrollment/:id" element={<EditEnrollment />} />
];

export default AppRoutes;