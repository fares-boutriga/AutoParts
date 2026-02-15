import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    isOpen: boolean;
    onClose: () => void;
    category?: any;
}

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
        },
    });

    useEffect(() => {
        if (category) {
            reset({ name: category.name });
        } else {
            reset({ name: '' });
        }
    }, [category, reset, isOpen]);

    const onSubmit = async (data: CategoryFormValues) => {
        if (category) {
            await updateCategory.mutateAsync({ id: category.id, data });
        } else {
            await createCategory.mutateAsync(data);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="e.g. Engine Parts"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {category ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
