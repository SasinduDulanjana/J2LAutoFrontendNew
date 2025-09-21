// src/app/customer.model.ts
export class Customer {
    id?: number; // Optional field
    name: string;
    email: string;
    phone: string;
    address: string;
    // other fields...
  
    constructor(address: string,phone: string,name: string, email: string, id?: number) {
      this.name = name;
      this.email = email;
      this.phone = phone;
      this.address = address;
      if (id) {
        this.id = id;
      }
    }
  }
  