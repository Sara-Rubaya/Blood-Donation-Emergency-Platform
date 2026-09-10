// Matches the mandatory response shape from the assignment brief
export class ApiResponse {
  static success(message: string, data: any = {}) {
    return { success: true, message, data };
  }

  static error(message: string, errors: any[] = []) {
    return { success: false, message, errors };
  }
}
