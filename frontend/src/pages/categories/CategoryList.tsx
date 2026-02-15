import { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryForm } from './CategoryForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function CategoryList() {
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const { data: categories, isLoading } = useCategories();
    const deleteCategory = useDeleteCategory();

    const filteredCategories = categories?.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (category: any) => {
        setSelectedCategory(category);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await deleteCategory.mutateAsync(id);
        }
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage your product categories</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Products Count</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredCategories?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories?.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {category._count?.products || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(category.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600"
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
                </CardContent>
            </Card>

            <CategoryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                category={selectedCategory}
            />
        </div>
    );
}
