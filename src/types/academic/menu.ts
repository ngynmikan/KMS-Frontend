export interface ApiMenu {
  menuId: number;
  classId: number;
  menuDate: string;
  mealType: string;
  menuContent: string;
  calories: number;
  allergens?: string | null;
  source?: string | null;
  supplierName?: string | null;
  preparedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  type: string;
}

export interface DailyMenu {
  date: string;
  classId: number;
  breakfast?: string;
  lunch?: string;
  snack?: string;
}
