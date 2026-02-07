import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Outlets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('outlets')
export class OutletsController {
    constructor(private outletsService: OutletsService) { }

    @Post()
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Create new outlet' })
    create(@Body() createOutletDto: CreateOutletDto) {
        return this.outletsService.create(createOutletDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all outlets' })
    findAll() {
        return this.outletsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get outlet by ID' })
    findOne(@Param('id') id: string) {
        return this.outletsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Update outlet' })
    update(@Param('id') id: string, @Body() updateOutletDto: UpdateOutletDto) {
        return this.outletsService.update(id, updateOutletDto);
    }

    @Delete(':id')
    @RequirePermissions('manage_outlets')
    @ApiOperation({ summary: 'Delete outlet' })
    remove(@Param('id') id: string) {
        return this.outletsService.remove(id);
    }
}
