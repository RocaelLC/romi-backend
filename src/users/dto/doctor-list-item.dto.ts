// src/users/dto/doctor-list-item.dto.ts
export class DoctorListItemDto {
  id!: string | number;
  name!: string;
  specialty!: string;
  city?: string | null;
  price?: number | null;        // MXN
  rating?: number | null;       // 0..5
  years_exp?: number | null;    // años de experiencia
  next_available?: string | null;
  languages?: string[] | null;  // ["Español", "Inglés"]
  is_available?: boolean | null;
}
