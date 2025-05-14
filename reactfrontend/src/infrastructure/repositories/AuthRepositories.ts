import { BaseRepository } from "../../Services/base/BaseRepository";

export interface LoginResponse {
  user_name:string;
  id: string;
  access_token: string;
  refresh_token: string;
}
export class AuthRepository extends BaseRepository<LoginResponse> {
  constructor() {
    super("/api"); 
  }

  async login(credentials: { user_name: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await this.post<LoginResponse>("/login/", credentials);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed. Please check your credentials.");
    }
  }

}

export const authRepository = new AuthRepository();