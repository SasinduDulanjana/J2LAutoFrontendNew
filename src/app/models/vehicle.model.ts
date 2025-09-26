export class Vehicle {
    id?: number; // Optional field
    name: string;
    make: string;
    model: string;
    year: number;

    constructor(name: string, make: string, model: string, year: number, id?: number) {
      this.name = name;
      this.make = make;
      this.model = model;
      this.year = year;
      if (id) {
        this.id = id;
      }
    }
}
