import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useCreateRole } from '@/hooks/useRoles';

interface RoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface RoleFormData {
    name: string;
    description?: string;
}

export default function RoleDialog({ open, onOpenChange }: RoleDialogProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RoleFormData>();

    const createRole = useCreateRole();

    const onSubmit = async (data: RoleFormData) => {
        try {
            await createRole.mutateAsync({
                name: data.name,
                description: data.description || undefined,
            });
            reset();
            onOpenChange(false);
        } catch (error) {
            // Error handling is managed by the hook
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Custom Role</DialogTitle>
                    <DialogDescription>
                        Custom roles allow you to build specific permission sets for tailored access control.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Role Name *</Label>
                        <Input
                            id="name"
                            {...register('name', { required: 'Role name is required' })}
                            placeholder="e.g., Regional Manager"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Briefly describe what this role allows."
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createRole.isPending}
                        >
                            {createRole.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Role
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
