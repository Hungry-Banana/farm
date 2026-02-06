import React from 'react';

interface FieldSectionProps {
    fields: Array<{ 
        label: string; 
        value: any; 
        icon: string;
    }>;
}

const FieldSection = ({ fields }: FieldSectionProps) => (
    <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {fields.map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{icon}</span>
                    <span>{label}:</span>
                </div>
                <div className="font-semibold">{value || 'N/A'}</div>
            </div>
        ))}
    </div>
);

export default FieldSection;
export type { FieldSectionProps };