import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    private setTokensInCookies(res: Response, accessToken: string, refreshToken: string) {
        // Set cookies to be HttpOnly, secure (in prod), SameSite Strict
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict' as const,
        };

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Successfully logged in' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);
        this.setTokensInCookies(res, result.accessToken, result.refreshToken);
        return result; // Still returning in body for backwards compatibility during migration, frontend will stop using it
    }

    @Get('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user profile' })
    async getMe(@Req() req: any) {
        return this.authService.getMe(req.user.id);
    }

    @Patch('me')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiBody({ type: UpdateMeDto })
    async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
        return this.authService.updateMe(req.user.id, dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = refreshTokenDto.refreshToken || req.cookies?.refreshToken;
        const result = await this.authService.refreshToken(token);
        this.setTokensInCookies(res, result.accessToken, result.refreshToken);
        return result;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({ status: 200, description: 'Successfully logged out' })
    async logout(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = refreshTokenDto.refreshToken || req.cookies?.refreshToken;
        if (token) {
            await this.authService.logout(token);
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }
}
