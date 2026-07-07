import {
  IAuthRepository,
  LoginCredentials,
  RegisterData,
} from '@/domain/repositories/IAuthRepository';
import { User } from '@/domain/entities/User';

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(credentials: LoginCredentials): Promise<User> {
    return this.authRepository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(data: RegisterData): Promise<User> {
    return this.authRepository.register(data);
  }
}

export class ForgotPasswordUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(email: string): Promise<void> {
    return this.authRepository.resetPassword(email);
  }
}

export class LogoutUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.logout();
  }
}

export class ReauthenticateUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  execute(password: string): Promise<void> {
    return this.authRepository.reauthenticate(password);
  }
}
