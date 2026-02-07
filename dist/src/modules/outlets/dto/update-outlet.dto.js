"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOutletDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_outlet_dto_1 = require("./create-outlet.dto");
class UpdateOutletDto extends (0, swagger_1.PartialType)(create_outlet_dto_1.CreateOutletDto) {
}
exports.UpdateOutletDto = UpdateOutletDto;
//# sourceMappingURL=update-outlet.dto.js.map