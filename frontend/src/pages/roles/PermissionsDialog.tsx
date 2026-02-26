import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { usePermissions, useAssignPermissions } from '@/hooks/useRoles';
import type { Role, Permission } from '@/lib/api/endpoints/roles';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PermissionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role;
}

export default function PermissionsDialog({ open, onOpenChange, role }: PermissionsDialogProps) {
    const { data: allPermissions, isLoading } = usePermissions();
    const assignPermissions = useAssignPermissions();

    // Local state for selected permission IDs
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize state when dialog opens or role changes
    useEffect(() => {
        if (open && role) {
            const currentIds = new Set(role.permissions.map(p => p.permissionId));
            setSelectedIds(currentIds);
        }
    }, [open, role]);

    const handleToggle = (permissionId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(permissionId)) {
                next.delete(permissionId);
            } else {
                next.add(permissionId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (allPermissions) {
            if (selectedIds.size === allPermissions.length) {
                setSelectedIds(new Set()); // Deselect all
            } else {
                setSelectedIds(new Set(allPermissions.map(p => p.id))); // Select all
            }
        }
    };

    const onSubmit = async () => {
        try {
            await assignPermissions.mutateAsync({
                id: role.id,
                permissionIds: Array.from(selectedIds),
            });
            onOpenChange(false);
        } catch (error) {
            // Error managed by hook
        }
    };

    const isAllSelected = allPermissions && allPermissions.length > 0 && selectedIds.size === allPermissions.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col pt-8 pb-6">
                <DialogHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Manage Permissions</DialogTitle>
                            <DialogDescription className="mt-1">
                                Configure access levels for <span className="font-semibold text-foreground">{role.name}</span>.
                                {role.isCustom ? '' : ' Core system roles can also be modified.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 mt-6 bg-muted/30 rounded-md border overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b bg-background/50">
                        <span className="text-sm font-medium">
                            {selectedIds.size} of {allPermissions?.length || 0} permissions selected
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={isLoading || !allPermissions?.length}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allPermissions?.map((permission: Permission) => (
                                    <div
                                        key={permission.id}
                                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                                        onClick={() => handleToggle(permission.id)}
                                    >
                                        <Checkbox
                                            id={`perm-${permission.id}`}
                                            checked={selectedIds.has(permission.id)}
                                            onCheckedChange={() => handleToggle(permission.id)}
                                            className="mt-1"
                                        />
                                        <div className="leading-none flex-1">
                                            <label
                                                htmlFor={`perm-${permission.id}`}
                                                className="text-sm font-medium leading-none cursor-pointer flex items-center justify-between"
                                            >
                                                {permission.key}
                                            </label>
                                            {permission.description && (
                                                <p className="text-sm text-muted-foreground mt-1.5 cursor-pointer">
                                                    {permission.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {allPermissions?.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No permissions available in the system.
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="shrink-0 pt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={assignPermissions.isPending || isLoading}
                        className="min-w-[120px]"
                    >
                        {assignPermissions.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
