import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgetPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './utils/local-auth.decorator';

@ApiTags('Auth')
@Public()
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() payload: RegisterRequestDto,
    @Param('type') type: string,
  ): Promise<AuthResponseDto> {
    return await this.authService.register(payload, type);
  }

  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() payload: LoginRequestDto): Promise<any> {
    return await this.authService.login(payload);
  }

  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(
    @Body() payload: ForgetPasswordRequestDto,
  ): Promise<any> {
    return await this.authService.forgetPassword(payload);
  }

  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordRequestDto): Promise<any> {
    return await this.authService.resetPassword(payload);
  }
}
