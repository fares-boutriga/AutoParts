import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

export default function OutletList() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Outlets
                </h1>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Outlet Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Store className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Outlet Management Coming Soon</p>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Manage multiple store locations, configure outlet settings, and track performance across locations.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
