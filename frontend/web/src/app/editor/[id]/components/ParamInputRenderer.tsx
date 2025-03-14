import React from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { DateTimePicker } from "./DateTimePicker";

interface ParamInputRendererProps {
    control: Control<FieldValues>;
    name: string;
    type: string;
    label: string;
    placeholder: string;
}

const ParamInputRenderer: React.FC<ParamInputRendererProps> = ({ control, name, type, label, placeholder }) => {

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                switch (type) {
                    case 'text':
                        return (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder={placeholder} {...field} />
                                </FormControl>
                            </FormItem>
                        );
                    case 'textarea':
                        return (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={placeholder} {...field} />
                                </FormControl>
                            </FormItem>
                        );
                    case 'number':
                        return (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder={placeholder} {...field} />
                                </FormControl>
                            </FormItem>
                        );
                    case 'switch':
                        return (
                            <FormItem className='flex items-center mb-4'>
                                <FormLabel className="flex-1 mr-4">{label}</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value === true}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        );
                    case 'date':
                        return (
                            <DateTimePicker label={label} field={field} placeholder={placeholder} />
                        );
                    default:
                        return (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder={placeholder} {...field} />
                                </FormControl>
                            </FormItem>
                        );
                }
            }}
        />
    );
};

export default ParamInputRenderer;
