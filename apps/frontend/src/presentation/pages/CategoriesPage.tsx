import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@application/hooks/useCategories';
import { Layout } from '@presentation/components/layout/Layout';
import * as Icons from 'lucide-react';
import { Category } from '@domain/interfaces/category.interface';
import { useLanguage } from '@application/contexts/LanguageContext';
import { translateCategory } from '@application/utils/translate-category';

const categorySchema = z.object({
    name: z.string().min(2).max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    icon: z.string().min(2),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    'shopping-cart': Icons.ShoppingCart,
    'utensils': Icons.Utensils,
    'car': Icons.Car,
    'bus': Icons.Bus,
    'train': Icons.Train,
    'plane': Icons.Plane,
    'home': Icons.Home,
    'zap': Icons.Zap,
    'wifi': Icons.Wifi,
    'phone': Icons.Phone,
    'tv': Icons.Tv,
    'laptop': Icons.Laptop,
    'heart-pulse': Icons.HeartPulse,
    'pill': Icons.Pill,
    'stethoscope': Icons.Stethoscope,
    'activity': Icons.Activity,
    'film': Icons.Film,
    'music': Icons.Music,
    'gamepad-2': Icons.Gamepad2,
    'dumbbell': Icons.Dumbbell,
    'shirt': Icons.Shirt,
    'shopping-bag': Icons.ShoppingBag,
    'gift': Icons.Gift,
    'sparkles': Icons.Sparkles,
    'briefcase': Icons.Briefcase,
    'graduation-cap': Icons.GraduationCap,
    'book': Icons.Book,
    'pencil': Icons.Pencil,
    'coffee': Icons.Coffee,
    'pizza': Icons.Pizza,
    'beer': Icons.Beer,
    'wine': Icons.Wine,
    'wallet': Icons.Wallet,
    'credit-card': Icons.CreditCard,
    'receipt': Icons.Receipt,
    'banknote': Icons.Banknote,
    'help-circle': Icons.HelpCircle,
    'star': Icons.Star,
    'tag': Icons.Tag,
    'folder': Icons.Folder,
};

const ICONS = Object.keys(ICON_MAP);

const DEFAULT_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#64748B', '#6B7280'
];

export const CategoriesPage = () => {
    const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
    const { language, t } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const successMessageRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            color: '#3B82F6',
            icon: 'tag',
        },
    });

    const selectedColor = watch('color');
    const selectedIcon = watch('icon');

    useEffect(() => {
        if (successMessage && successMessageRef.current) {
            successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [successMessage]);

    const onSubmit = async (data: CategoryFormData) => {
        setCreating(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
                setSuccessMessage(t.categoriesPage.successUpdated);
            } else {
                await createCategory(data);
                setSuccessMessage(t.categoriesPage.successCreated);
            }
            setShowForm(false);
            setEditingCategory(null);
            reset({
                name: '',
                color: '#3B82F6',
                icon: 'tag',
            });
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Failed to save category:', err);
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            color: category.color,
            icon: category.icon,
        });
        setShowForm(true);
        setTimeout(() => {
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCategory(id);
            setConfirmDelete(null);
            setSuccessMessage(t.categoriesPage.successDeleted);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        reset({
            name: '',
            color: '#3B82F6',
            icon: 'tag',
        });
    };

    const getIcon = (iconName: string) => {
        return ICON_MAP[iconName] || Icons.Tag;
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: '#0f172a' }}>
                                {t.categoriesPage.title}
                            </h1>
                            <p className="mt-1" style={{ color: '#334155' }}>
                                {t.categoriesPage.subtitle}
                            </p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                                <Icons.Plus className="w-5 h-5" />
                                {t.actions.add}
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <Icons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div
                        ref={successMessageRef}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-slide-up"
                    >
                        <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div
                        ref={formRef}
                        className="mb-8 rounded-lg shadow-sm border border-gray-200 p-6"
                        style={{ backgroundColor: '#ffffff' }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold" style={{ color: '#0f172a' }}>
                                {editingCategory ? t.categoriesPage.editCategory : t.categoriesPage.newCategory}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Icons.X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                                    {t.categoriesPage.categoryName}
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder={t.categoriesPage.categoryNamePlaceholder}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                                    {t.categoriesPage.color}
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-12 h-12 rounded-lg border-2 border-gray-300"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                        <input
                                            {...register('color')}
                                            type="color"
                                            className="w-16 h-10 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFAULT_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setValue('color', color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-blue-600 scale-110' : 'border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {errors.color && (
                                    <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                                )}
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                                    {t.categoriesPage.icon}
                                </label>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                    {ICONS.map((icon) => {
                                        const IconComponent = getIcon(icon);
                                        return (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setValue('icon', icon)}
                                                className={`p-2.5 rounded-lg border-2 transition-all hover:scale-105 flex items-center justify-center ${selectedIcon === icon
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                                    }`}
                                            >
                                                <IconComponent className="w-5 h-5 flex-shrink-0" style={{ color: selectedColor }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                                >
                                    {creating && <Icons.Loader2 className="w-5 h-5 animate-spin" />}
                                    {editingCategory ? t.categoriesPage.updateCategory : t.categoriesPage.createCategory}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t.categoriesPage.cancel}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading && !categories.length ? (
                    <div className="flex items-center justify-center py-12">
                        <Icons.Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map((category) => {
                            const IconComponent = getIcon(category.icon);

                            return (
                                <div
                                    key={category.id}
                                    className="rounded-lg shadow-md p-6 flex flex-col gap-4"
                                    style={{ backgroundColor: '#ffffff' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: category.color + '20', color: category.color }}
                                        >
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold" style={{ color: '#1e293b' }}>
                                                {translateCategory(category.name, language)}
                                            </h3>
                                            {category.isDefault && (
                                                <span className="text-xs text-gray-500">{t.categoriesPage.defaultCategory}</span>
                                            )}
                                        </div>
                                    </div>

                                    {!category.isDefault && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Icons.Edit2 className="w-4 h-4" />
                                                {t.categoriesPage.edit}
                                            </button>
                                            {confirmDelete === category.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                    >
                                                        {t.categoriesPage.confirm}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                                    >
                                                        {t.categoriesPage.cancel}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDelete(category.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Icons.Trash2 className="w-4 h-4" />
                                                    {t.categoriesPage.delete}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && categories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            {t.categoriesPage.noCategories}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};
