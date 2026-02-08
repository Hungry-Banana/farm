import React from 'react';

interface EditableField {
    label: string;
    value: any;
    icon: string;
    name: string;
    type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
    options?: Array<{ label: string; value: string | number }>;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
}

interface EditableFieldSectionProps {
    fields: EditableField[];
    onChange: (name: string, value: any) => void;
}

const EditableFieldSection = ({ fields, onChange }: EditableFieldSectionProps) => {
    const handleChange = (name: string, value: any) => {
        onChange(name, value);
    };

    const renderInput = (field: EditableField) => {
        const baseClasses = "p-1 text-sm rounded-theme border border-island_border bg-island_background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-right font-semibold min-w-[200px]";
        
        if (field.disabled) {
            return (
                <div className="font-semibold text-sm min-w-[200px] text-right">
                    {field.value || 'N/A'}
                </div>
            );
        }

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        className={`${baseClasses} w-full resize-none text-left min-w-full`}
                    />
                );
            
            case 'select':
                return (
                    <select
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`${baseClasses} cursor-pointer`}
                    >
                        <option value="">Select...</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            
            case 'number':
                return (
                    <input
                        type="number"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseClasses}
                    />
                );
            
            case 'date':
                return (
                    <input
                        type="date"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={baseClasses}
                    />
                );
            
            case 'email':
                return (
                    <input
                        type="email"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseClasses}
                    />
                );
            
            case 'text':
            default:
                return (
                    <input
                        type="text"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseClasses}
                    />
                );
        }
    };

    return (
        <div className="grid grid-cols-2 gap-x-7 gap-y-2">
            {fields.map((field) => (
                <div key={field.name} className={`flex items-center justify-between ${field.type === 'textarea' ? 'col-span-2' : ''}`}>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{field.icon}</span>
                        <span>{field.label}:</span>
                    </div>
                    {renderInput(field)}
                </div>
            ))}
        </div>
    );
};

export default EditableFieldSection;
export type { EditableFieldSectionProps, EditableField };
