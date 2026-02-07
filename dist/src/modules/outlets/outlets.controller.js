"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const outlets_service_1 = require("./outlets.service");
const create_outlet_dto_1 = require("./dto/create-outlet.dto");
const update_outlet_dto_1 = require("./dto/update-outlet.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let OutletsController = class OutletsController {
    outletsService;
    constructor(outletsService) {
        this.outletsService = outletsService;
    }
    create(createOutletDto) {
        return this.outletsService.create(createOutletDto);
    }
    findAll() {
        return this.outletsService.findAll();
    }
    findOne(id) {
        return this.outletsService.findOne(id);
    }
    update(id, updateOutletDto) {
        return this.outletsService.update(id, updateOutletDto);
    }
    remove(id) {
        return this.outletsService.remove(id);
    }
};
exports.OutletsController = OutletsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('manage_outlets'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new outlet' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_outlet_dto_1.CreateOutletDto]),
    __metadata("design:returntype", void 0)
], OutletsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all outlets' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OutletsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get outlet by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OutletsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('manage_outlets'),
    (0, swagger_1.ApiOperation)({ summary: 'Update outlet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_outlet_dto_1.UpdateOutletDto]),
    __metadata("design:returntype", void 0)
], OutletsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('manage_outlets'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete outlet' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OutletsController.prototype, "remove", null);
exports.OutletsController = OutletsController = __decorate([
    (0, swagger_1.ApiTags)('Outlets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('outlets'),
    __metadata("design:paramtypes", [outlets_service_1.OutletsService])
], OutletsController);
//# sourceMappingURL=outlets.controller.js.map