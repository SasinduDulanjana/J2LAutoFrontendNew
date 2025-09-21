export class Supplier {

  supId?: number; // Optional field
    name: string;
    email: string;
    phone: string;
    address: string;
    // other fields...
  
    constructor(address: string,phone: string,name: string, email: string, supId?: number) {
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.address = address;
      if (supId) {
        this.supId = supId;
      }
    }
}
