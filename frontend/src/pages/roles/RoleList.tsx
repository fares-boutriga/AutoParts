import { useState } from 'react';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Shield,
    Plus,
    Search,
    Trash2,
    Settings2,
    Loader2,
} from 'lucide-react';
import RoleDialog from './RoleDialog';
import PermissionsDialog from './PermissionsDialog';
import type { Role } from '@/lib/api/endpoints/roles';

export default function RoleList() {
    const [search, setSearch] = useState('');
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();

    const { data: roles, isLoading, isError } = useRoles();
    const deleteRole = useDeleteRole();

    const handleCreateRole = () => {
        setRoleDialogOpen(true);
    };

    const handleManagePermissions = (role: Role) => {
        setSelectedRole(role);
        setPermissionsDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete role "${name}"? This action cannot be undone.`)) {
            await deleteRole.mutateAsync(id);
        }
    };

    const filteredRoles = roles?.filter(
        (role) =>
            role.name.toLowerCase().includes(search.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
    );

    if (isError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Roles & Permissions
                </h1>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">Error loading roles. Please try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Roles & Permissions
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage system roles and control access to different features.
                    </p>
                </div>
                <Button onClick={handleCreateRole} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Create Custom Role
                </Button>
            </div>

            <Card className="border-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <CardHeader>
                    <CardTitle>All Roles</CardTitle>
                    <div className="relative max-w-sm mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search roles..."
                            className="pl-8 bg-background/50 backdrop-blur-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-card/50 backdrop-blur-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            Loading roles...
                                        </TableCell>
                                    </TableRow>
                                ) : !filteredRoles || filteredRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                    <Shield className="h-8 w-8 text-primary" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="font-medium">
                                                        {search ? 'No roles found' : 'No roles yet'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {search
                                                            ? 'Try adjusting your search'
                                                            : 'Get started by creating a role'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRoles.map((role) => (
                                        <TableRow key={role.id} className="group transition-colors hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Shield className={`h-4 w-4 ${role.isCustom ? 'text-blue-500' : 'text-primary'}`} />
                                                    {role.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {role.description || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={role.isCustom ? "outline" : "default"}
                                                    className={role.isCustom ? "text-blue-500 border-blue-200 bg-blue-50" : ""}
                                                >
                                                    {role.isCustom ? 'Custom' : 'System'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">
                                                    {role.permissions.length} keys
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 group-hover:bg-background"
                                                        onClick={() => handleManagePermissions(role)}
                                                    >
                                                        <Settings2 className="mr-2 h-3.5 w-3.5" />
                                                        Permissions
                                                    </Button>
                                                    {role.isCustom && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-red-600 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(role.id, role.name)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <RoleDialog
                open={roleDialogOpen}
                onOpenChange={setRoleDialogOpen}
            />

            {selectedRole && (
                <PermissionsDialog
                    open={permissionsDialogOpen}
                    onOpenChange={setPermissionsDialogOpen}
                    role={selectedRole}
                />
            )}
        </div>
    );
}
