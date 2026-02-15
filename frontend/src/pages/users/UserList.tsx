import { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUser } from '@/hooks/useUsers';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MoreHorizontal,
    Plus,
    Search,
    Pencil,
    Trash2,
    Loader2,
    UserCog,
    Shield,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import UserDialog from './UserDialog';
import type { User } from '@/lib/api/endpoints/users';

export default function UserList() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();

    const { data: users, isLoading, isError } = useUsers();
    const deleteUser = useDeleteUser();
    const updateUser = useUpdateUser();

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(undefined);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete user "${name}"?`)) {
            await deleteUser.mutateAsync(id);
        }
    };

    const handleToggleStatus = async (user: User) => {
        await updateUser.mutateAsync({
            id: user.id,
            data: { isActive: !user.isActive },
        });
    };

    const filteredUsers = users?.filter(
        (user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (isError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Users
                </h1>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">Error loading users. Please try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Users
                </h1>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <div className="relative max-w-sm mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                            Loading users...
                                        </TableCell>
                                    </TableRow>
                                ) : !filteredUsers || filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                    <UserCog className="h-8 w-8 text-primary" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="font-medium">
                                                        {search ? 'No users found' : 'No users yet'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {search
                                                            ? 'Try adjusting your search'
                                                            : 'Get started by creating your first user'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone || '—'}</TableCell>
                                            <TableCell>
                                                {user.roles && user.roles.length > 0 ? (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {user.roles.slice(0, 2).map((ur) => (
                                                            <Badge
                                                                key={ur.role.id}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                {ur.role.name}
                                                            </Badge>
                                                        ))}
                                                        {user.roles.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{user.roles.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">
                                                        No roles
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.isActive ? 'default' : 'secondary'}
                                                    className="gap-1"
                                                >
                                                    {user.isActive ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(user)}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            {user.isActive ? (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() =>
                                                                handleDelete(user.id, user.name)
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={selectedUser}
            />
        </div>
    );
}
