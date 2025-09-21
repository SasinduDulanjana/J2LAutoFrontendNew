export class Category {
    catId?: number; // Optional field
    name: string;
    catDesc: string;
    parent?: number;

  
    constructor(name: string, catDesc: string, catId?: number, parent?: number) {
      this.name = name;
      this.catDesc = catDesc;
      this.parent = parent;
      if (catId) {
        this.catId = catId;
      }
    }
}
