export interface User{
  id: number,
  password: string,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  is_staff: boolean;
  is_active: boolean;
}
