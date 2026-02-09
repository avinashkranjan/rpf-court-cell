import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/integrations/supabase/client';

interface Officer {
  id: string;
  full_name: string;
  designation: string;
  belt_number: string | null;
  post_name: string;
}

interface OfficerComboboxProps {
  value?: string;
  onChange: (officerId: string, officer: Officer | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const OfficerCombobox: React.FC<OfficerComboboxProps> = ({
  value,
  onChange,
  placeholder = 'Select officer...',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, designation, belt_number, post_name')
        .order('full_name');

      if (!error && data) {
        setOfficers(data);
      }
      setLoading(false);
    };
    fetchOfficers();
  }, []);

  const selectedOfficer = officers.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedOfficer ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {selectedOfficer.designation}/{selectedOfficer.full_name}
                {selectedOfficer.belt_number && ` (${selectedOfficer.belt_number})`}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Search officers by name, designation, belt..." />
          <CommandList>
            <CommandEmpty>
              {loading ? 'Loading officers...' : 'No officer found.'}
            </CommandEmpty>
            <CommandGroup>
              {officers.map((officer) => (
                <CommandItem
                  key={officer.id}
                  value={`${officer.full_name} ${officer.designation} ${officer.belt_number || ''} ${officer.post_name}`}
                  onSelect={() => {
                    onChange(officer.id === value ? '' : officer.id, officer.id === value ? null : officer);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === officer.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {officer.designation}/{officer.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {officer.belt_number && `Belt: ${officer.belt_number} | `}
                      {officer.post_name}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default OfficerCombobox;
