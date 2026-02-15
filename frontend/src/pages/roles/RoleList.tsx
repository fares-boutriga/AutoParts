import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function RoleList() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Roles & Permissions
                </h1>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Shield className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Role Management Coming Soon</p>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Create and manage user roles, define permissions, and control access levels throughout the system.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
