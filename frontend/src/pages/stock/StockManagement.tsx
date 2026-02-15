import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function StockManagement() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Stock Management
                </h1>
                <Button asChild>
                    <Link to="/stock/alerts">
                        View Alerts
                    </Link>
                </Button>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Box className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">Stock Management Coming Soon</p>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Manage inventory levels across outlets, track stock movements, and configure reorder points.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
