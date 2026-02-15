import { useState } from 'react';
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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import type { User } from '@/lib/api/endpoints/users';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User;
}

interface UserFormData {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}

export default function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isEditing = !!user;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<UserFormData>({
        defaultValues: user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
            }
            : {},
    });

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const password = watch('password');

    const onSubmit = async (data: UserFormData) => {
        try {
            if (isEditing) {
                const updateData: any = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || undefined,
                };
                if (data.password) {
                    updateData.password = data.password;
                }
                await updateUser.mutateAsync({ id: user.id, data: updateData });
            } else {
                if (!data.password) {
                    return;
                }
                await createUser.mutateAsync({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || undefined,
                    password: data.password,
                });
            }
            reset();
            onOpenChange(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update user information. Leave password blank to keep current password.'
                            : 'Fill in the details to create a new user account.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            {...register('name', { required: 'Name is required' })}
                            placeholder="John Doe"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            placeholder="user@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="+1234567890"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password {isEditing ? '(optional)' : '*'}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: isEditing ? false : 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value) =>
                                            value === password || 'Passwords do not match',
                                    })}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createUser.isPending || updateUser.isPending}
                        >
                            {(createUser.isPending || updateUser.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
