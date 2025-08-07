class AcademicPeriods {
    constructor(data = {}) {
      this.id = data.id || null;
      this.institutionId = data.institutionId || null;
      this.periodName = data.periodName || '';
      this.startDate = data.startDate ? new Date(data.startDate) : null;
      this.endDate = data.endDate ? new Date(data.endDate) : null;
      this.status = data.status || 'A';
    }
  }
  
  export default AcademicPeriods;