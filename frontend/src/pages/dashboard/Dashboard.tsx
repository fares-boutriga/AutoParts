import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue Card */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                    <div className="absolute inset-0 gradient-card-blue opacity-100" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Total Revenue</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-white">$45,231.89</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-4 w-4 text-green-200" />
                            <p className="text-sm text-white/80 font-medium">+20.1% from last month</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Orders Card */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 gradient-card-purple opacity-100" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Active Orders</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-white">+2,350</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-4 w-4 text-green-200" />
                            <p className="text-sm text-white/80 font-medium">+180.1% from last month</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Products in Stock Card */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 gradient-card-green opacity-100" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Products in Stock</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-white">+12,234</div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="h-4 w-4 text-green-200" />
                            <p className="text-sm text-white/80 font-medium">+19% from last month</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts Card */}
                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute inset-0 gradient-card-red opacity-100" />
                    <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Low Stock Alerts</CardTitle>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce-subtle">
                            <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-white">7</div>
                        <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-4 w-4 text-orange-200" />
                            <p className="text-sm text-white/80 font-medium">Requires attention</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sales Section */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Recent Sales
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
                                <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-lg">Recent transactions will appear here</p>
                            <p className="text-sm text-muted-foreground/70">Start making sales to see activity</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
