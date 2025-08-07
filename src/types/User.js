class User {
    constructor(data = {}) {
      this.id = data.id || null;
      this.firstname = data.firstname || '';
      this.lastname = data.lastname || '';
      this.documentType = data.documentType || '';
      this.documentNumber = data.documentNumber || '';
      this.email = data.email || '';
      this.phone = data.phone || '';
      this.password = data.password || '';
      this.userImage = data.userImage || '';
      this.role = data.role || '';
      this.status = data.status || '';
      this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
      this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    }
  
    // Métodos de dominio
    activate() {
      this.status = "A";
      this.updatedAt = new Date();
    }
  
    deactivate() {
      this.status = "I";
      this.updatedAt = new Date();
    }
  
    isActive() {
      return "A" === this.status;
    }
  
    updateInformation(firstname, lastname, documentType, documentNumber, 
                     email, phone, password, userImage, role) {
      this.firstname = firstname;
      this.lastname = lastname;
      this.documentType = documentType;
      this.documentNumber = documentNumber;
      this.email = email;
      this.phone = phone;
      this.password = password;
      this.userImage = userImage;
      this.role = role;
      this.updatedAt = new Date();
    }
  
    static createNew(firstname, lastname, documentType, documentNumber,
                     email, phone, password, userImage, role) {
      return new User({
        firstname,
        lastname,
        documentType,
        documentNumber,
        email,
        phone,
        password,
        userImage,
        role,
        status: "A",
        createdAt: new Date()
      });
    }
  }
  
  export default User;

  // Clase MagnamentEducational.