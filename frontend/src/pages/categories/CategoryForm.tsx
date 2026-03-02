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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    <DialogTitle>{category ? t('categories_page.form.editTitle') : t('categories_page.form.addTitle')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('categories_page.form.nameLabel')}</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder={t('categories_page.form.namePlaceholder')}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{t('categories_page.form.nameRequired')}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('categories_page.form.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {category ? t('categories_page.form.update') : t('categories_page.form.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
